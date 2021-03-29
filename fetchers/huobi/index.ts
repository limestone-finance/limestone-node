import LimestoneApi from "limestone-api-v2-beta";
import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/huobi") as Consola;
const symbolToUsdtPairId: { [symbol: string]: string } =
  require("./huobi-symbol-to-usdt-pair-id.json") as any;

const URL = "https://api.huobi.pro/market/detail";

const huobiFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    const prices: PriceDataFetched[] = [];

    // Fetching USDT price in USD from Limestone API
    const usdtPriceInUSD = await LimestoneApi.getPrice("USDT");
    if (usdtPriceInUSD === undefined) {
      throw new Error("Cannot fetch USDT price from limestone api");
    }

    for (const symbol of tokenSymbols) {
      const usdtPairId = symbolToUsdtPairId[symbol];
      if (usdtPairId !== undefined) {
        // Fetching price for current symbol in USDT
        const response = await axios.get(URL, {
          params: {
            symbol: usdtPairId,
          },
        });
        if (response.data === undefined) {
          throw new Error(
            "Response data is undefined: " + JSON.stringify(response));
        }
        const priceInUSDT = response.data.tick.close;

        // Calculating price for current symbol in USD
        const priceInUSD = usdtPriceInUSD.value * priceInUSDT;
        prices.push({
          symbol,
          value: priceInUSD,
        });
      } else {
        logger.warn(
          `Token is not supported with coingecko source: ${symbol}`);
      }
    }

    return prices;
  }
};

export default huobiFetcher;
