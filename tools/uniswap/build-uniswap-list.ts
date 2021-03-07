import fs from "fs";
import axios from "axios";

// USAGE: ts-node tools/uniswap/build-uniswap-list.ts <PATH_TO_JSON_WITH_ALL_PAIRS>

const AAVE_TOKEN_LIST = "https://tokenlist.aave.eth.link/";
const UNISAP_PAIRS = "https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json";

main();

async function main() {
  const [ allPairsPath ] = process.argv.slice(2);

  if (allPairsPath === undefined) {
    console.log("USAGE: ts-node tools/uniswap/get-most-popular-tokens.ts <PATH_TO_JSON_WITH_ALL_PAIRS>");
    return;
  }

  const allPairs = JSON.parse(fs.readFileSync(allPairsPath, { encoding: "utf-8" }));
  // const pairsFromTokenLists = await getUniswapPairsFromTokenLists();
  const aaveTokens = await getAaveTokens();

  const uniswapSymbolToAddress = {};
  for (const aaveToken of aaveTokens) {
    const uniswapAddress = getUniswapAddress(aaveToken.symbol, allPairs);
    uniswapSymbolToAddress[aaveToken.symbol] = uniswapAddress;

    // uniswapSymbolToAddress[aaveToken.symbol] =
    //   await findPairs(aaveToken.symbol, pairsFromTokenLists);
  }

  // console.log(aaveTokens);
  console.log(uniswapSymbolToAddress);

  const counters = {
    found: 0,
    notFound: 0,
  };
  for (let symbol in uniswapSymbolToAddress) {
    if (uniswapSymbolToAddress[symbol].volumeUSD === 0) {
    // if (uniswapSymbolToAddress[symbol].length) {
      counters.notFound++;
    } else {
      counters.found++;
    }
  }

  // console.log(counters);
  // console.log("Aave tokens count: " + aaveTokens.length);

  printFoundTokensAsJSON(uniswapSymbolToAddress);
}

function printFoundTokensAsJSON(tokens) {
  const result = {};
  for (const token in tokens) {
    if (tokens[token].address) {
      result[token] = tokens[token].address;
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

async function getAaveTokens() {
  const response = await axios.get(AAVE_TOKEN_LIST);
  return response.data.tokens;
}

async function getUniswapPairsFromTokenLists() {
  const response = await axios.get(UNISAP_PAIRS);
  return response.data.tokens;
}

async function findPairs(symbol, pairs) {
  const result = [];
  console.log('Hmm');
  console.log(pairs);
  for (const pair of pairs) {
    if (pair.name.includes(symbol)) {
      result.push(pair);
    }
  }
  return result;
}

function getUniswapAddress(symbol, allPairs) {
  let maxVolumeUSD = 0, address = "", isToken1 = false, anotherToken = "";
  for (const pair of allPairs) {
    if (pair.token0.symbol === symbol && pair.volumeUSD > maxVolumeUSD) {
      maxVolumeUSD = pair.volumeUSD;
      address = pair.id;
      anotherToken = pair.token1.symbol;
    }

    // if (pair.token1.symbol === symbol && pair.volumeUSD > maxVolumeUSD) {
    //   maxVolumeUSD = pair.volumeUSD;
    //   address = pair.id;
    //   isToken1 = true;
    //   anotherToken = pair.token0.symbol;
    // }
  }
  return { address, volumeUSD: maxVolumeUSD, isToken1, anotherToken };
}

function countTokens(pairs: any[]) {
  const tokensCount = {};

  function countToken(symbol: string) {
    if (tokensCount[symbol] === undefined) {
      tokensCount[symbol] = 1;
    } else {
      tokensCount[symbol]++;
    }
  }

  for (const pair of pairs) {
    countToken(pair.token0.symbol);
    countToken(pair.token1.symbol);
  }

  console.log(tokensCount);
}
