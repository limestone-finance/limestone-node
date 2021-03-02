import CoinGecko from "coingecko-api";
import symbolToId from "./coingecko-symbol-to-id.json";
import { PriceData } from "../types";

const CoinGeckoClient = new CoinGecko();

async function fetch(symbol: string): Promise<PriceData> {
  // Converting symbol to coingecko token id
  const tokenId = symbolToId[symbol];
  if (tokenId === undefined) {
    throw new Error(`Coingecko doesn't support this token: "${symbol}"`);
  }

  // Fetching token price
  const response = await CoinGeckoClient.simple.price(tokenId, {
    ids: symbol,
  });

  return {
    symbol,
    id: tokenId,
    price: response.data[symbol].usd,
  };
};

async function fetchAll(tokenSymbols: string[]): Promise<PriceData[]> {
  // Converting array of symbols to array of ids
  const ids = [];
  for (const symbol of tokenSymbols) {
    if (symbolToId[symbol] !== undefined) {
      ids.push(symbolToId[symbol]);
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
  fetch,
  fetchAll,
};
