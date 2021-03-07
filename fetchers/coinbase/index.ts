import Coinbase from "coinbase";
import colors from "colors";
import { PriceData } from "../../types";

const CoinbaseClient = Coinbase.Client;
const coinbaseConfig: any = {
  "apiKey": "KEY",
  "apiSecret": "SECRET",
  "strictSSL": false,
};
const coinbaseClient = new CoinbaseClient(coinbaseConfig);

async function fetchAll(tokenSymbols: string[]): Promise<PriceData[]> {
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
    const price = rates[symbol];
    if (price !== undefined) {
      prices.push({
        symbol,
        price: 1 / price,
      });
    } else {
      console.warn(
        colors.bold.bgYellow(
          `Token is not supported with coinbase source: ${symbol}`));
    }
  }

  return prices;
}

export default {
  fetchAll,
};
