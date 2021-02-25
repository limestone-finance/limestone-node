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
  const response = await CoinGeckoClient.coins.markets({
    ids,
    per_page: 1000,
    localization: false,
  });
  
  return response.data.map(coin => {
    return {
      symbol: coin.symbol,
      price: coin.current_price,
    };
  });
}

//EXPORTS:

module.exports = {
  fetch,
  fetchAll,
};
