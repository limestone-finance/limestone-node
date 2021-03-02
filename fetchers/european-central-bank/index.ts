import { exchangeRates } from "exchange-rates-api";
import moment from "moment";

async function fetchBundle(tokenName, days) {
  console.log("Fetching: " + tokenName + " days: " + days);
  const rawPrices = await exchangeRates()
    .from(moment().subtract(1, 'month').format('YYYY-MM-DD'))
    .to(moment().format('YYYY-MM-DD'))
    .symbols(['USD'])
    .base(tokenName)
    .fetch();
  const prices = Object.keys(rawPrices).map(date => {
    return [moment(date).toDate().getTime(), rawPrices[date].USD];
  });
  const sortedPrices = prices.sort((a, b) => a[0] - b[0]);

  return sortedPrices;
};

async function fetchLatest(tokenName) {
  console.log(`Fetching ${tokenName} latest price`);
  const price =
    await exchangeRates().symbols(['USD']).latest().base(tokenName).fetch();
  return price;
}

export default {
  fetchBundle,
  fetchLatest,
};
