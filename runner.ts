import uuid from "uuid-random";
import _ from "lodash";
import { Consola } from "consola";
import { JWKInterface } from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
import { timeout } from 'promise-timeout';
import fetchers from "./fetchers";
import keepers from "./keepers";
import aggregators from "./aggregators";
import broadcaster from "./broadcasters/lambda-broadcaster";
import ArweaveProxy from "./utils/arweave-proxy";
import { trackStart, trackEnd } from "./utils/performance-tracker";
import {
  PriceDataBeforeAggregation,
  PriceDataAfterAggregation,
  PriceDataBeforeSigning,
  PriceDataFetched,
  PriceDataSigned,
  Manifest,
} from "./types";

const logger = require("./utils/logger")("runner") as Consola;

const { version } = require("./package.json") as any;

const MIN_AR_BALANCE = 0.1;
const DEFAULT_FETCHER_TIMEOUT = 50000; // ms

export default class Runner {
  manifest: Manifest;
  arweave: ArweaveProxy;
  providerAddress: string;
  infuraApiKey?: string;
  covalentApiKey?: string;

  constructor(opts: {
    manifest: Manifest;
    arweave: ArweaveProxy;
    provider: string;
    infuraApiKey?: string;
    covalentApiKey?: string;
  }) {
    this.manifest = opts.manifest;
    this.arweave = opts.arweave;
    this.providerAddress = opts.provider;
    this.infuraApiKey = opts.infuraApiKey;
    this.covalentApiKey = opts.covalentApiKey;
  }

  static async init(opts: {
    manifest: Manifest,
    jwk: JWKInterface,
    infuraApiKey?: string,
    covalentApiKey?: string
  }): Promise<Runner> {
      const arweave = new ArweaveProxy(opts.jwk);
      const provider = await arweave.getAddress();
      const optsToCopy = _.pick(opts, [
        "manifest",
        "infuraApiKey",
        "covalentApiKey"
      ]);
      return new Runner({
        ...optsToCopy,
        arweave,
        provider,
      });
    }

  async run(): Promise<void> {
    logger.info("Running limestone-node with manifest: ");
    logger.info(JSON.stringify(this.manifest));
    logger.info(`Address: ${this.providerAddress}`);

    // Assure minimum balance
    await this.checkBalance({
      stopNodeIfBalanceIsLow: true,
      notifyIfBalanceIsLow: false,
    });

    const runIteration = async () => {
      trackStart("processing-all");
      await this.processAll();
      trackEnd("processing-all");

      trackStart("balance-checking");
      await this.checkBalance({
        stopNodeIfBalanceIsLow: false,
        notifyIfBalanceIsLow: true,
      });
      trackEnd("balance-checking");
    };

    await runIteration(); // Start immediately then repeat in manifest.interval
    setInterval(runIteration, this.manifest.interval);
  }

  private async checkBalance(args: {
    stopNodeIfBalanceIsLow: boolean,
    notifyIfBalanceIsLow: boolean,
  }): Promise<void> {
    const balance = await this.arweave.getBalance();
    const isLow = balance < MIN_AR_BALANCE;
    logger.info(`Balance: ${balance}`);

    if (args.notifyIfBalanceIsLow && isLow) {
      const warningText = `AR balance is quite low: ${balance}`;
      logger.warn(warningText);
    }

    if (args.stopNodeIfBalanceIsLow && isLow) {
      logger.fatal(
        `You should have at least ${MIN_AR_BALANCE} AR to start a node service.`);
      process.exit(0);
    }
  }

  async processAll(): Promise<void> {
    logger.info("Processing tokens");

    trackStart("fetching-all");
    const prices: PriceDataAfterAggregation[] = await this.fetchAll();
    trackEnd("fetching-all");

    for (const price of prices) {
      const sourcesData = JSON.stringify(price.source);
      logger.info(
        `Fetched price : ${price.symbol} : ${price.value} | ${sourcesData}`);
    }

    // Preparing arweave transaction
    logger.info("Keeping prices on arweave blockchain - preparing transaction");
    const { prepareTransaction } = keepers.basic;
    const transaction: Transaction =
      await prepareTransaction(prices, this.arweave);

    // Signing each price separately
    const signedPrices: PriceDataSigned[] = [];
    for (const price of prices) {
      // Signing price data
      logger.info(`Signing price: ${price.id}`);
      const signed: PriceDataSigned = await this.signPrice({
        ...price,
        permawebTx: transaction.id,
        provider: this.providerAddress,
      });

      signedPrices.push(signed);
    }

    // Broadcasting
    logger.info("Broadcasting prices");
    try {
      trackStart("broadcasting");
      await broadcaster.broadcast(signedPrices);
      trackEnd("broadcasting");
      logger.info("Broadcasting completed");
    } catch (e) {
      if (e.response !== undefined) {
        logger.error("Broadcasting failed: " + e.response.data, e.stack);
      } else {
        logger.error("Broadcasting failed", e.stack);
      }
    }

    // Posting prices data on arweave blockchain
    logger.info(
      "Keeping prices on arweave blockchain - posting transaction "
      + transaction.id);
    trackStart("keeping");
    await this.arweave.postTransaction(transaction);
    trackEnd("keeping");
    logger.info(`Transaction posted: ${transaction.id}`);
  }

  async fetchAll(): Promise<PriceDataAfterAggregation[]> {

    const sources = this.groupTokensBySource();

    // Fetching token prices from all sources in parallel
    // And grouping them by token symbols
    const prices: { [symbol: string]: PriceDataBeforeAggregation } = {};
    const timestamp = Date.now();
    const promises: Promise<void>[] = [];
    for (const source in sources) {
      promises.push(
        this.safeFetchFromSourceAndGroup(
          source,
          sources,
          timestamp,
          prices));
    }
    await Promise.all(promises);

    return this.calculateAggregatedValues(_.values(prices));
  }

  async safeFetchFromSourceAndGroup(
    source: string,
    sources: { [source: string]: string[] },
    timestamp: number,
    prices: { [symbol: string]: PriceDataBeforeAggregation }) {
      try {
        // Fetching
        const pricesFromSource = await this.fetchFromSource({
          symbols: sources[source],
          source,
          timeout: DEFAULT_FETCHER_TIMEOUT,
        });
        logger.info(
          `Fetched prices in USD for ${pricesFromSource.length} `
          + `currencies from source: "${source}"`);

        // Grouping
        for (const price of pricesFromSource) {
          if (prices[price.symbol] === undefined) {
            prices[price.symbol] = {
              id: uuid(), // Generating unique id for each price
              source: {},
              symbol: price.symbol,
              timestamp,
              version,
            };
          }
          prices[price.symbol].source[source] = price.value;
        }
      } catch (e) {
        // We don't throw an error because we want to continue with
        // other fetchers even if some fetchers failed
        logger.error(`Fetching failed for source: ${source}`, e.stack);
      }
    }

  async fetchFromSource(args: {
    symbols: string[];
    source: string;
    timeout: number;
  }): Promise<PriceDataFetched[]> {
      trackStart(`fetching-${args.source}`);
      const fetchPromise = fetchers[args.source].fetchAll(args.symbols, {
        covalentApiKey: this.covalentApiKey,
        infuraApiKey: this.infuraApiKey,
      }).then((prices) => {
        trackEnd(`fetching-${args.source}`);
        return prices;
      });

      return timeout(fetchPromise, args.timeout);
    }

  // This function converts tokens from manifest to object with the following
  // type: { <SourceName>: <Array of tokens to fetch from source> }
  groupTokensBySource(): { [source: string]: string[] } {
    const sources: { [source: string]: string[] } = {};

    for (const symbol in this.manifest.tokens) {
      const source = this.manifest.tokens[symbol].source;
      let sourcesForToken: string[];

      // If no source is defined for token
      // we use global source from manifest
      if (source === undefined) {
        if (this.manifest.defaultSource === undefined) {
          const errMsg =
            `Token source is not defined for "${symbol}"`
            + ` and global source is not defined`;
          throw new Error(errMsg);
        } else {
          sourcesForToken = this.manifest.defaultSource;
        }
      } else {
        sourcesForToken = source;
      }

      for (const singleSource of sourcesForToken) {
        if (!sources[singleSource]) {
          sources[singleSource] = [symbol];
        } else {
          sources[singleSource].push(symbol);
        }
      }
    }

    return sources;
  }

  calculateAggregatedValues(
    prices: PriceDataBeforeAggregation[]): PriceDataAfterAggregation[] {
    return prices.map((p) =>
      aggregators[this.manifest.priceAggregator].getAggregatedValue(p));
  }

  async signPrice(
    price: PriceDataBeforeSigning): Promise<PriceDataSigned> {

    // TODO: think about keeping stringified version which was signed
    // to avoid problems with signature verification
    const priceStringified = JSON.stringify(price);
    const signature: string = await this.arweave.sign(priceStringified);

    return {
      ...price,
      signature,
    };
  }

};
