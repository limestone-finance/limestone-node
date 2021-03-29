import LimestoneApi from "limestone-api-v2-beta";
import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/coingecko") as Consola;

const URL = "https://api-cloud.bitmart.com/spot/v1/ticker";

const bitmartFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    if (tokenSymbols.length === 0) {
      logger.warn(`Bitmap fetcher received an empty array of symbols`);
      return [];
    }

    if (tokenSymbols.some(symbol => symbol !== "AR")) {
      logger.warn(`Currently bitmap fetcher supports only AR token`);
    }

    // Fetching AR price in USDT from bitmart api
    const response = await axios.get(URL, {
      params: { symbol: "AR_USDT" },
    });
    if (response.data === undefined) {
      throw new Error(
        "Response data is undefined: " + JSON.stringify(response));
    }
    const arPriceInUSDT = Number(response.data.data.tickers[0].last_price);

    // Fetching USDT price in USD from Limestone api
    const usdtPrice = await LimestoneApi.getPrice("USDT");
    if (usdtPrice === undefined) {
      throw new Error("Cannot fetch USDT price from limestone");
    }

    // Calculating AR price in USD
    const arPriceInUSD = usdtPrice.value * arPriceInUSDT;

    return [{
      symbol: "AR",
      value: arPriceInUSD,
    }];
  }
};

export default bitmartFetcher;
