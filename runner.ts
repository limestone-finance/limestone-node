import {Consola} from "consola";
import {JWKInterface} from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
import aggregators from "./aggregators";
import broadcaster from "./broadcasters/lambda-broadcaster";
import ArweaveProxy from "./utils/arweave-proxy";
import {trackEnd, trackStart} from "./utils/performance-tracker";
import {Credentials, Manifest, PriceDataAfterAggregation, PriceDataSigned,} from "./types";
import mode from "./mode";
import ManifestHelper, {TokensBySource} from "./ManifestParser";
import ArweaveService from "./ArweaveService";
import PricesService, {PricesBeforeAggregation, PricesDataFetched} from "./PricesService";
import {mergeObjects} from "./utils/objects";

const logger = require("./utils/logger")("runner") as Consola;
const pjson = require("./package.json") as any;

//shouldn't we get this value from some external service/configuration
// (that cannot be changed/accessed by node providers)?
const MIN_AR_BALANCE = 0.1;

//TODO: make it configurable (main and token lvl)
const DEFAULT_FETCHER_TIMEOUT = 50000; // ms

export default class Runner {
  private version: string;
  private arService: ArweaveService;
  private priceFetchService: PricesService;

  private constructor(
    private manifest: Manifest,
    private arweave: ArweaveProxy,
    private providerAddress: string,
    credentials: Credentials,
  ) {
    this.version = getVersionFromPackageJSON();
    this.arService = new ArweaveService(
      this.arweave, this.version, MIN_AR_BALANCE);
    this.priceFetchService = new PricesService(
      DEFAULT_FETCHER_TIMEOUT, credentials);

    //note: setInterval binds "this" to a new context
    //https://www.freecodecamp.org/news/the-complete-guide-to-this-in-javascript/
    //alternatively use arrow functions...
    this.runIteration = this.runIteration.bind(this);
  }

  static async create(
    manifest: Manifest,
    jwk: JWKInterface,
    credentials: Credentials,
  ): Promise<Runner> {
    const arweave = new ArweaveProxy(jwk);
    const providerAddress = await arweave.getAddress();

    return new Runner(
      manifest,
      arweave,
      providerAddress,
      credentials
    );
  }

  async run(): Promise<void> {
    logger.info(
      `Running limestone-node with manifest:
      ${JSON.stringify(this.manifest)}
      Version: ${this.version}
      Address: ${this.providerAddress}
    `);

    // Assure minimum balance
    const {balance, isBalanceLow} = await this.arService.checkBalance();
    if (isBalanceLow) {
      logger.fatal(
        `You should have at least ${MIN_AR_BALANCE} AR to start a node service. Current balance: ${balance}`);
      //TODO: I did not like the fact the some private method had a side-effect
      // of exiting the whole app ("principle of least suprise"?)
      // - so I'm moving this here - to the "top" level
      process.exit(0); //TODO: why do we exit only on first check?
    }

    await this.runIteration(); // Start immediately then repeat in manifest.interval
    setInterval(this.runIteration, this.manifest.interval);
  }

  private async runIteration() {
    await this.processManifestTokens();
    await this.warnIfARBalanceLow();
  };

  private async processManifestTokens() {
    try {
      trackStart("processing-all");
      await this.doProcessTokens();
    } catch (e) {
      logger.error("Processing all failed", e.stack);
    } finally {
      trackEnd("processing-all");
    }
  }

  private async warnIfARBalanceLow() {
    try {
      trackStart("balance-checking");
      const {balance, isBalanceLow} = await this.arService.checkBalance();
      if (isBalanceLow) {
        logger.warn(`AR balance is quite low: ${balance}`);
      }
    } catch (e) {
      logger.error("Balance checking failed", e.stack);
    } finally {
      trackEnd("balance-checking");
    }
  }

  private async doProcessTokens(): Promise<void> {
    logger.info("Processing tokens");

    const aggregatedPrices: PriceDataAfterAggregation[] = await this.fetchPrices();

    //czy musimy tworzyc transakcje dla srodowiska testowego,
    //skoro i tak nie jest potem efektywnie zapisywana?
    const arTransaction: Transaction = await this.arService.prepareArweaweTransaction(aggregatedPrices);

    const signedPrices: PriceDataSigned[] = await this.arService.signPrices(
      aggregatedPrices, arTransaction.id, this.providerAddress);

    await this.broadcastPrices(signedPrices)

    if (mode.isProd) {
      await this.arService.storePricesOnArweave(arTransaction);
    } else {
      logger.info(
        `Transaction posting skipped in non-prod env: ${arTransaction.id}`);
    }
  }

  private async fetchPrices(): Promise<PriceDataAfterAggregation[]> {
    trackStart("fetching-all");
    //is it necessary to run this in each 'runIteration'?
    //- manifest doest not change in runtime (?)..
    const tokensBySource: TokensBySource = ManifestHelper.groupTokensBySource(this.manifest);

    const fetchTimestamp = Date.now();
    const pricesData: PricesDataFetched = mergeObjects(
      await this.priceFetchService.fetchInParallel(tokensBySource));

    const pricesBeforeAggregation: PricesBeforeAggregation =
      PricesService.groupPricesByToken(fetchTimestamp, pricesData, this.version);

    const aggregatedPrices: PriceDataAfterAggregation[] = PricesService.calculateAggregatedValues(
      Object.values(pricesBeforeAggregation), //what is the advantage of using lodash.values?
      aggregators[this.manifest.priceAggregator]
    );
    this.printAggregatedPrices(aggregatedPrices);

    trackEnd("fetching-all");

    return aggregatedPrices;
  }

  private async broadcastPrices(signedPrices: PriceDataSigned[]) {
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
  }

  private printAggregatedPrices(prices: PriceDataAfterAggregation[]): void {
    //czy musimy mierzyć wydajność logowania..? :)
    trackStart("fetched-prices-printing");
    for (const price of prices) {
      const sourcesData = JSON.stringify(price.source);
      logger.info(
        `Fetched price : ${price.symbol} : ${price.value} | ${sourcesData}`);
    }
    trackEnd("fetched-prices-printing");
  }
};

function getVersionFromPackageJSON() {
  const [major] = pjson.version.split(".");
  return major;
}
