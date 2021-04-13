import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/kraken") as Consola;
const supportedPairs: string[] = require("./kraken-supported-pairs.json");

const URL = "https://api.kraken.com/0/public/Ticker";

const krakenFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    if (tokenSymbols.length === 0) {
      logger.warn(`Kraken fetcher received an empty array of symbols`);
      return [];
    }

    // Building params for api request
    const pairs = [];
    for (const symbol of tokenSymbols) {
      const pair = symbol + "USD";
      if (supportedPairs.includes(pair)) {
        pairs.push(pair);
      } else {
        logger.warn(
          `Token is not supported with kraken source: ${symbol}`);
      }
    }

    // Fetching ptices from Kraken API
    const response = await axios.get(URL, {
      params: {
        pair: pairs.join(","),
      },
    });
    if (response.data === undefined) {
      throw new Error(
        "Response data is undefined: " + JSON.stringify(response));
    } else if (response.data.error.length > 0) {
      throw new Error(
        "Error response: " + JSON.stringify(response));
    }

    // Parsing response
    // Helpful info: https://www.kraken.com/features/api#get-ticker-info
    const prices = [];
    for (const symbol of tokenSymbols) {
      const price = response.data.result[symbol + "USD"];
      if (price !== undefined) {
        prices.push({
          symbol,
          value: Number(price.c[0]),
        });
      }
    }

    return prices;
  }
};

export default krakenFetcher;
