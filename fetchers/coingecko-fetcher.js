const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

const symbolToName = {
  "ETH": "ethereum"
};

async function fetch(symbol) {
  let response = await CoinGeckoClient.coins.fetch(symbolToName[symbol], {
    ico_data: false,
    community_data: false,
    developer_data: false,
    localization: false,
    tickers: false
  });
  return response.data.market_data.current_price.usd;
};

//EXPORTS:

module.exports.fetch = fetch;
