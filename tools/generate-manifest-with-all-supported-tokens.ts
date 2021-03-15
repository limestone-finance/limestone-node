import _ from "lodash";

// Load manifests with all supported tokens
const balancer = require("../sample-manifests/balancer.json") as any;
const coinbase = require("../sample-manifests/coinbase.json") as any;
const coingecko = require("../sample-manifests/coingecko.json") as any;
const ecb = require("../sample-manifests/ecb.json") as any;
const kyber = require("../sample-manifests/kyber.json") as any;
const sushiswap = require("../sample-manifests/sushiswap.json") as any;
const uniswap = require("../sample-manifests/uniswap.json") as any;

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
  ];

  // Building tokens
  const tokens: any = {};
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
  const tokensWithSortedKeys: any = {};
  const sortedKeys = _.keys(tokens).sort((token1, token2) => {
    return tokens[token2].source.length - tokens[token1].source.length;
  });
  for (const symbol of sortedKeys) {
    tokensWithSortedKeys[symbol] = tokens[symbol];
  }

  const manifest = {
    interval: 15000,
    priceAggregator: "median",
    tokens: tokensWithSortedKeys,
  };

  console.log(JSON.stringify(manifest, null, 2));
}
