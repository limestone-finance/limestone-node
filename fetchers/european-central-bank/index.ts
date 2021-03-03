import { exchangeRates } from "exchange-rates-api";
import moment from "moment";
import { PriceData } from "../types";

async function fetchBundle(tokenName: string, days: number) {
  console.log(`Fetching ${tokenName} days ${days}`);

  const dateTo = new Date(moment().format('YYYY-MM-DD')),
        dateFrom = new Date(moment().subtract(1, 'month').format('YYYY-MM-DD'));

  const rawPrices = await exchangeRates()
    .from(dateFrom)
    .to(dateTo)
    .symbols(['USD'])
    .base(tokenName)
    .fetch();

  const prices = Object.keys(rawPrices).map(date => {
    return [moment(date).toDate().getTime(), rawPrices[date].USD];
  });
  const sortedPrices = prices.sort((a, b) => a[0] - b[0]);

  return sortedPrices;
};

// TODO: maybe we should remove this function
async function fetchLatest(tokenName: string) {
  console.log(`Fetching ${tokenName} latest price`);
  const price =
    await exchangeRates().symbols(['USD']).latest().base(tokenName).fetch();
  return price;
}

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
  fetchBundle,
  fetchLatest,
  fetchAll,
};
