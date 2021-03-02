import CoinGecko from "coingecko-api";
import Coinbase from "coinbase";

const CoinGeckoClient = new CoinGecko();

const CoinbaseClient = Coinbase.Client;
const coinbaseClient = new CoinbaseClient({
  'apiKey': 'KEY',
  'apiSecret': 'SECRET',
  strictSSL: false
});

const symbolsMapping = {
  "kyber-network": "KNC",
  "maker": "MKR",
  "loopring": "LRC"
};

// TODO: Hmm, why coinbase fetcher contains coingecko api request
async function fetchBundle(tokenName, days) {
  console.log("Fetching: " + tokenName + " days: " + days);
  let response = await CoinGeckoClient.coins.fetchMarketChart(tokenName, {days: days});
  return response.data.prices;
};

async function fetchLatest(tokenName) {
  console.log("Fetching: " + tokenName + " latest price");
  return new Promise((resolve, reject) => {
    coinbaseClient.getSpotPrice({'currencyPair': symbolsMapping[tokenName] + '-USD'}, function (err, response) {
      if (err) {
        console.log("Error");
        console.log(err);
      }
      return response.data.amount;
    });
  });
}

export default {
  fetchBundle,
  fetchLatest,
};
