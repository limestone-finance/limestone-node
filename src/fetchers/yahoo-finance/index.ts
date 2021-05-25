import yahooFinance from "yahoo-finance";
import { Consola } from "consola";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/yahoo-finance") as Consola;

const yahooFinanceFetcher: Fetcher = {
  async fetchAll(symbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices from Yahoo Finance
    const quotes: any = await new Promise((resolve, reject) => {
      yahooFinance.quote({
        symbols,
        modules: ["price"],
      }, (err: any, quotes: any) => {
        if (err) {
          reject(err);
        }
        resolve(quotes);
      });
    });

    // Building prices
    const prices: PriceDataFetched[] = [];
    for (const symbol of symbols) {
      const details = quotes[symbol];
      if (details !== undefined) {
        prices.push({
          symbol,
          value: getPriceValue(details),
        });
      } else {
        logger.warn(
          `Token is not supported with yahoo-finance source: ${symbol}`);
      }
    }

    return prices;
  }
};

function getPriceValue(details: any) {
  const value: any = details.price.regularMarketPrice;
  if (isNaN(value)) {
    return value.raw;
  } else {
    return value;
  }
}

export default yahooFinanceFetcher;
