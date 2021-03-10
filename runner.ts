import consoleStamp from "console-stamp";
import uuid from "uuid-random";
import _ from "lodash";
import colors from "colors";
import { JWKInterface } from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
import fetchers from "./fetchers";
import keepers from "./keepers";
import aggregators from "./aggregators";
import broadcaster from "./broadcasters/lambda-broadcaster";
import ArweaveProxy from "./utils/arweave-proxy";
import config from "./config";
import {
  PriceDataBeforeAggregation,
  PriceDataAfterAggregation,
  PriceDataBeforeSigning,
  PriceDataSigned,
  Manifest,
} from "./types";

const MIN_AR_BALANCE:Number = 0.1;

//Format logs
consoleStamp(console, { pattern: "[HH:MM:ss.l]" });

export default class Runner {
  manifest: Manifest;
  arweave: ArweaveProxy;
  providerAddress: string;

  constructor(manifest: Manifest, arweave: ArweaveProxy, provider: string) {
    this.manifest = manifest;
    this.arweave = arweave;
    this.providerAddress = provider;
  }

  static async init(manifest: Manifest, jwk: JWKInterface): Promise<Runner> {
    const arweave = new ArweaveProxy(jwk);
    const providerAddress = await arweave.getAddress();
    return new Runner(manifest, arweave, providerAddress);
  }

  async run(): Promise<void> {
    console.log("Running limestone-node with manifest: ");
    console.log(JSON.stringify(this.manifest));
    let balance = await this.arweave.getBalance();
    console.log(`Address: ${this.providerAddress}`);
    console.log(`Balance: ${balance}`);

    //Assure minimum balance
    if (balance < MIN_AR_BALANCE) {
      console.log(`You should have at least ${MIN_AR_BALANCE} AR to start a node service.`);
      process.exit(0);
    }

    const runIteration = async () => {
      await this.processAll();
    };

    await runIteration(); // Start immediately then repeat in manifest.interval
    setInterval(runIteration, this.manifest.interval);
  }

  async processAll(): Promise<void> {
    console.log("Processing tokens");

    const prices: PriceDataAfterAggregation[] = await this.fetchAll();

    // TODO: decide if this logging is really needed
    for (const price of prices) {
      console.log(
        `Fetched price : ${price.symbol} : ${price.value}`);
    }

    // Preparing arweave transaction
    console.log("Keeping prices on arweave blockchain - preparing transaction");
    const { prepareTransaction } = keepers.basic;
    const transaction: Transaction =
      await prepareTransaction(prices, this.arweave);

    // Signing each price separately
    const signedPrices: PriceDataSigned[] = [];
    for (const price of prices) {
      // Signing price data
      console.log(`Signing price: ${price.id}`);
      const signed: PriceDataSigned = await this.signPrice({
        ...price,
        permawebTx: transaction.id,
        provider: this.providerAddress,
      });
      signedPrices.push(signed);
    }

    // Broadcasting
    console.log("Broadcasting prices");
    try {
      await broadcaster.broadcast(signedPrices);
    } catch (e) {
      console.error(colors.bgRed("Broadcasting failed"));
      console.error(e);
    }

    // Posting prices data on arweave blockchain
    console.log(
      "Keeping prices on arweave blockchain - posting transaction "
      + transaction.id);
    await this.arweave.postTransaction(transaction);
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
        const pricesFromSource =
          await fetchers[source].fetchAll(sources[source]);
        console.log(
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
              version: config.version,
            };
          }
          prices[price.symbol].source[source] = price.value;
        }
      } catch (e) {
        // We don't throw an error because we want to continue with
        // other fetchers even if some fetchers failed
        console.error(
          colors.bgRed(`Fetching failed for source: ${source}`));
        console.error(e);
      }
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
            + `and global source is not defined`;
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
