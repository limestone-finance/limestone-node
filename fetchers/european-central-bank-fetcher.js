const { exchangeRates } = require('exchange-rates-api');
const moment = require('moment');

async function fetchBundle(tokenName, days) {
  console.log("Fetching: " + tokenName + " days: " + days);
  let rawPrices = await exchangeRates()
    .from(moment().subtract(1, 'month').format('YYYY-MM-DD'))
    .to(moment().format('YYYY-MM-DD'))
    .symbols(['USD'])
    .base(tokenName)
    .fetch();
  let prices = Object.keys(rawPrices).map( date => {
    return [moment(date).toDate().getTime(), rawPrices[date].USD];
  });
  prices = prices.sort((a,b) => a[0]-b[0]);
  return prices;
};

async function fetchLatest(tokenName) {
  console.log("Fetching: " + tokenName + " latest price");
  let price = await exchangeRates().symbols(['USD']).latest().base(tokenName).fetch();
  return price;
}

//EXPORTS:
module.exports.fetchBundle = fetchBundle;
module.exports.fetchLatest = fetchLatest;
