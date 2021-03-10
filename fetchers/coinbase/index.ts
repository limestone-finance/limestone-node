import Coinbase from "coinbase";
import colors from "colors";
import { PriceDataFetched, Fetcher } from "../../types";

const coinbaseClient = new Coinbase.Client({
  "apiKey": "KEY",
  "apiSecret": "SECRET",
  "strictSSL": false,
} as any);

const coinbaseFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices
    const currencies: any = await new Promise((resolve, reject) => {
      coinbaseClient.getExchangeRates({
        "currency": "USD",
      }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.data);
        }
      });
    });

    // Building prices array
    const prices = [];
    for (const symbol of tokenSymbols) {
      const rates = currencies.rates;
      const exchangeRate = rates[symbol];
      if (exchangeRate !== undefined) {
        prices.push({
          symbol,
          value: 1 / exchangeRate,
        });
      } else {
        console.warn(
          colors.bold.bgYellow(
            `Token is not supported with coinbase source: ${symbol}`));
      }
    }

    return prices;
  },
};

export default coinbaseFetcher;
