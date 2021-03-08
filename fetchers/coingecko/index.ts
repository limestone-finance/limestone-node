import CoinGecko from "coingecko-api";
import colors from "colors";
import symbolToId from "./coingecko-symbol-to-id.json";
import { PriceDataFetched, Fetcher } from "../../types";

const CoinGeckoClient = new CoinGecko();

const coingeckoFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Converting array of symbols to array of ids
    const ids = [], idToSymbol = {};
    for (const symbol of tokenSymbols) {
      const id = symbolToId[symbol];
      if (id !== undefined) {
        ids.push(symbolToId[symbol]);
        idToSymbol[id] = symbol;
      } else {
        console.warn(
          colors.bold.bgYellow(`Coingecko doesn't support token: ${symbol}`));
      }
    }

    // Fetching prices data
    const response = await CoinGeckoClient.simple.price({ ids });

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
