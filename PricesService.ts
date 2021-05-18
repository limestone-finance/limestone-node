import { Consola } from "consola";
import { timeout } from "promise-timeout";
import fetchers from "./fetchers";
import { TokensBySource } from "./ManifestParser";
import {
  Aggregator,
  Credentials,
  PriceDataAfterAggregation,
  PriceDataBeforeAggregation,
  PriceDataFetched
} from "./types";
import { trackEnd, trackStart } from "./utils/performance-tracker";
import { v4 as uuidv4 } from 'uuid'

const logger = require("./utils/logger")("PricesFetcher") as Consola;

export type PricesDataFetched = { [source: string]: PriceDataFetched[] };
export type PricesBeforeAggregation = { [token: string]: PriceDataBeforeAggregation }

export default class PricesService {

  constructor(
    private fetchTimeout: number,
    private credentials: Credentials
  ) {
  }

  async fetchInParallel(tokensBySource: TokensBySource)
    : Promise<PricesDataFetched[]> {

    const promises: Promise<PricesDataFetched>[] = [];

    for (const source in tokensBySource) {
      promises.push(
        this.safeFetchFromSource(
          source,
          tokensBySource[source]));
    }

    return await Promise.all(promises);
  }

  private async safeFetchFromSource(
    source: string,
    tokens: string[]): Promise<PricesDataFetched> {
    try {
      // Fetching
      const pricesFromSource = await this.doFetchFromSource(source, tokens);

      return {
        source: pricesFromSource
      }

    } catch (e) {
      // We don't throw an error because we want to continue with
      // other fetchers even if some fetchers failed
      const resData = e.response ? e.response.data : "";
      logger.error(
        `Fetching failed for source: ${source}: ${resData}`, e.stack);
      return {};
    }
  }

  private async doFetchFromSource(source: string, tokens: string[])
  : Promise<PriceDataFetched[]> {
    if (tokens.length === 0) {
      //to później jest łapane w "safeFetch". Nie wiem, czy to dobrze
      //bo chyba taka sytuacja świadczy o błędzie w implementacji/konfiguracji
      //i raczej powinniśmy tutaj "fail fast"?
      throw new Error(
        `${source} fetcher received an empty array of symbols`);
    }

    trackStart(`fetching-${source}`);
    const fetchPromise = fetchers[source].fetchAll(tokens, {
      credentials: this.credentials,
    }).then((prices) => {
      trackEnd(`fetching-${source}`);
      logger.info(
        `Fetched prices in USD for ${prices.length} `
        + `currencies from source: "${source}"`);
      return prices;
    });

    //fail if there is no response after given timeout
    return timeout(fetchPromise, this.fetchTimeout);
  }

  static groupPricesByToken(
    fetchTimestamp: number, pricesData: PricesDataFetched, nodeVersion: string): PricesBeforeAggregation {

    const result: PricesBeforeAggregation = {};

    for (const source in pricesData) {
      for (const price of pricesData[source]) {

        if (result[price.symbol] === undefined) {
          result[price.symbol] = {
            id: uuidv4(), // Generating unique id for each price
            source: {},
            symbol: price.symbol,
            timestamp: fetchTimestamp,
            version: nodeVersion,
          };
        }

        //that's not very intuitive..
        result[price.symbol].source[source] = price.value;
      }
    }

    return result;
  }

  static calculateAggregatedValues(
    prices: PriceDataBeforeAggregation[],
    aggregator: Aggregator
  ): PriceDataAfterAggregation[] {

    const aggregatedPrices: PriceDataAfterAggregation[] = [];
    for (const price of prices) {
      try {
        const priceAfterAggregation = aggregator.getAggregatedValue(price);
        if (priceAfterAggregation.value <= 0
          || priceAfterAggregation.value === undefined) {
          throw new Error(
            "Invalid price value: "
            + JSON.stringify(priceAfterAggregation));
        }
        aggregatedPrices.push(priceAfterAggregation);
      } catch (e) {
        //obsługa błędów...
        logger.error(e.stack);
      }
    }
    return aggregatedPrices;
  }
}
