import { exchangeRates } from "exchange-rates-api";
import { PriceData } from "../../types";

async function fetchAll(symbols: string[]): Promise<PriceData[]> {
  // Fetching prices
  const response = (await exchangeRates()
    .latest()
    .base('USD')
    .symbols(symbols)
    .fetch());

  // Building prices array
  const prices = [];
  if (typeof response === "object") {
    for (const symbol in response) {
      prices.push({
        symbol,
        price: response[symbol],
      });
    }
  } else {
    prices.push({
      symbol: symbols[0],
      price: response,
    });
  }

  return prices;
}

export default {
  fetchAll,
};
