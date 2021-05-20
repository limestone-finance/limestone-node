import { Consola } from "consola";
import { PriceDataFetched, Fetcher } from "../../types";

const CoinGecko = require("coingecko-api") as any;
const logger =
  require("../../utils/logger")("fetchers/coingecko") as Consola;
const symbolToId: { [symbol: string]: string } =
  require("./coingecko-symbol-to-id.json") as any;

const coinGeckoClient = new CoinGecko();

const coingeckoFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Converting array of symbols to array of ids
    const ids = [];
    const idToSymbol: { [id: string]: string } = {};
    for (const symbol of tokenSymbols) {
      const id = symbolToId[symbol];
      if (id !== undefined) {
        ids.push(symbolToId[symbol]);
        idToSymbol[id] = symbol;
      } else {
        logger.warn(
          `Token is not supported with coingecko source: ${symbol}`);
      }
    }

    // Fetching prices data
    const response = await coinGeckoClient.simple.price({ ids });

    // Building prices array
    const prices = [];
    for (const id in response.data) {
      prices.push({
        symbol: idToSymbol[id],
        value: response.data[id].usd,
      });
    }

    return prices;
  },
};

export default coingeckoFetcher;
