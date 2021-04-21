const _ = require("lodash");

// Load manifests with all supported tokens
const balancer = require("../../sample-manifests/balancer.json");
const coinbase = require("../../sample-manifests/coinbase.json");
const coingecko = require("../../sample-manifests/coingecko.json");
const ecb = require("../../sample-manifests/ecb.json");
const kyber = require("../../sample-manifests/kyber.json");
const sushiswap = require("../../sample-manifests/sushiswap.json");
const uniswap = require("../../sample-manifests/uniswap.json");
const bitmart = require("../../sample-manifests/bitmart.json");
const huobi = require("../../sample-manifests/huobi.json");
const binance = require("../../sample-manifests/binance.json");
const kraken = require("../../sample-manifests/kraken.json");
const bitfinex = require("../../sample-manifests/bitfinex.json");

main();

function main() {
  const manifests = [
    balancer,
    coinbase,
    coingecko,
    ecb,
    kyber,
    sushiswap,
    uniswap,
    bitmart,
    huobi,
    binance,
    kraken,
    bitfinex,
  ];

  // Building tokens
  const tokens = {};
  for (const sourceManifest of manifests) {
    const sourceId = sourceManifest.defaultSource[0];

    for (const tokenName in sourceManifest.tokens) {
      if (tokens[tokenName] !== undefined) {
        tokens[tokenName].source.push(sourceId);
      } else {
        tokens[tokenName] = {
          source: [sourceId],
        };
      }
    }
  }

  // Sort tokens by number of sources
  const tokensWithSortedKeys = {};
  const sortedKeys = _.keys(tokens).sort((token1, token2) => {
    return tokens[token2].source.length - tokens[token1].source.length;
  });
  for (const symbol of sortedKeys) {
    tokensWithSortedKeys[symbol] = tokens[symbol];
  }

  const manifest = {
    interval: 60000,
    priceAggregator: "median",
    tokens: tokensWithSortedKeys,
  };

  console.log(JSON.stringify(manifest, null, 2));
}
