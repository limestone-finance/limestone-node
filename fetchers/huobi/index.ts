import LimestoneApi from "limestone-api-v2-beta";
import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";
import { trackStart, trackEnd } from "../../utils/performance-tracker";

const logger =
  require("../../utils/logger")("fetchers/huobi") as Consola;
const symbolToUsdtPairId: { [symbol: string]: string } =
  require("./huobi-symbol-to-usdt-pair-id.json") as any;

const URL = "https://api.huobi.pro/market/detail";

const huobiFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    const prices: PriceDataFetched[] = [];

    trackStart("huobi-fetcher-usdt-price-fetching");
    const usdtPrice = await getUsdtPriceInUSD();
    trackEnd("huobi-fetcher-usdt-price-fetching");

    // Fetching prices asynchronously
    const promises: Promise<void>[] = [];
    for (const symbol of tokenSymbols) {
      const usdtPairId = symbolToUsdtPairId[symbol];
      if (usdtPairId !== undefined) {
        promises.push((async () => {
          // Fetching price for current symbol in USDT
          const fetchingLabel =
            `huobi-fetcher-${symbol.toLowerCase()}-fetching`;
          trackStart(fetchingLabel);
          const response = await axios.get(URL, {
            params: {
              symbol: usdtPairId,
            },
          });
          trackEnd(fetchingLabel);

          if (response.data === undefined) {
            throw new Error(
              "Response data is undefined: " + JSON.stringify(response));
          }

          const priceInUSDT = response.data.tick.close;

          // Calculating price for current symbol in USD
          const priceInUSD = usdtPrice * priceInUSDT;

          // Saving result
          prices.push({
            symbol,
            value: priceInUSD,
          });

        })());
      } else {
        logger.warn(
          `Token is not supported with coingecko source: ${symbol}`);
      }
    }

    // Waiting for all fetches completion
    await Promise.all(promises);

    return prices;
  }
};

// Fetching from Limestone API
async function getUsdtPriceInUSD(): Promise<number> {
  const usdtPriceInUSD = await LimestoneApi.getPrice("USDT");
  if (usdtPriceInUSD === undefined) {
    throw new Error("Cannot fetch USDT price from limestone api");
  }

  return usdtPriceInUSD.value;
}

export default huobiFetcher;
