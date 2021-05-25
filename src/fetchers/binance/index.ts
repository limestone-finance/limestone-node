import LimestoneApi from "limestone-api";
import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/binance") as Consola;

const URL = "https://api.binance.com/api/v3/ticker/price";

const binanceFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices from Binance API
    const response = await axios.get(URL);
    if (response.data === undefined) {
      throw new Error(
        "Response data is undefined: " + JSON.stringify(response));
    }

    // Parsing the response
    const pairs: { [symbol: string]: number } = {};
    for (const pair of response.data) {
      pairs[pair.symbol] = Number(pair.price);
    }

    // Fetching USDT price from limestone
    const usdtPrice = await LimestoneApi.getPrice("USDT");

    // Building prices
    const prices: PriceDataFetched[] = [];
    for (const symbol of tokenSymbols) {
      const value = pairs[symbol + "USDT"];
      if (value !== undefined) {
        prices.push({
          symbol,
          value: usdtPrice.value * value,
        });
      } else {
        logger.warn(
          `Token is not supported with binance source: ${symbol}`);
      }
    }

    return prices;
  }
};

export default binanceFetcher;
