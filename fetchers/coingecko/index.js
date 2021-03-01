const CoinGecko = require('coingecko-api');
const symbolToId = require('./coingecko-symbol-to-id.json');

const CoinGeckoClient = new CoinGecko();

async function fetch(symbol) {
  const response = await CoinGeckoClient.coins.fetch(symbolToId[symbol], {
    ico_data: false,
    community_data: false,
    developer_data: false,
    localization: false,
    tickers: false
  });
  return response.data.market_data.current_price.usd;
};

async function fetchAll(tokenSymbols) {
  const ids = tokenSymbols.map((symbol) => symbolToId[symbol]);
  const response = await CoinGeckoClient.simple.price({ ids });
  const prices = [];

  for (const symbol in response.data) {
    prices.push({
      symbol,
      price: response.data[symbol].usd,
    });
  }

  return prices;
}

module.exports = {
  fetch,
  fetchAll,
};
