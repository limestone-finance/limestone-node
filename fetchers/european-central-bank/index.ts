import { exchangeRates } from "exchange-rates-api";
import { PriceDataFetched, Fetcher } from "../../types";

const ecbFetcher: Fetcher = {
  async fetchAll(symbols: string[]): Promise<PriceDataFetched[]> {
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
          value: response[symbol],
        });
      }
    } else {
      prices.push({
        symbol: symbols[0],
        value: response,
      });
    }

    return prices;
  },
};

export default ecbFetcher;
