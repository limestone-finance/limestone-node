import CoinGecko from "coingecko-api";
import colors from "colors";
import symbolToId from "./coingecko-symbol-to-id.json";
import { PriceData } from "../types";

const CoinGeckoClient = new CoinGecko();

async function fetchAll(tokenSymbols: string[]): Promise<PriceData[]> {
  // Converting array of symbols to array of ids
  const ids = [];
  for (const symbol of tokenSymbols) {
    if (symbolToId[symbol] !== undefined) {
      ids.push(symbolToId[symbol]);
    } else {
      console.warn(
        colors.bold.bgYellow(`Coingecko doesn't support token: ${symbol}`));
    }
  }

  // Fetching prices data
  const response = await CoinGeckoClient.simple.price({ ids });

  // Building prices array
  const prices = [];
  for (const symbol in response.data) {
    prices.push({
      symbol,
      price: response.data[symbol].usd,
    });
  }

  return prices;
}

export default {
  fetchAll,
};
