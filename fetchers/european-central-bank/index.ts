import { exchangeRates } from "exchange-rates-api";
import { PriceDataFetched, Fetcher } from "../../types";

interface EcbResponseObject {
  [symbol: string]: number,
};

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
          value: (response as EcbResponseObject)[symbol],
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
