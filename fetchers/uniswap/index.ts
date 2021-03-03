import fetchFromGraph from "isomorphic-fetch";
import { PriceData } from "../types";

const UNISWAP_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

// TODO: change fetching prices directly from uniswap
// Beacause the most accurate data in uniswap subgraph is pairHourDatas

const UNISWAP_PAIRS = {
  chi: "0xa6f3ef841d371a82ca757fad08efc0dee2f1f5e2",
  uni: "0xd3d2e2692501a5c9ca623199d38826e513033a17",
  comp: "0xcffdded873554f362ac02f8fb1f02e5ada10516f"
};

async function fetchLatest(tokenName) {
  console.log("Fetching latest price: " + tokenName);
  let id = UNISWAP_PAIRS[tokenName];
  let query = `{
    pairHourDatas(orderBy: hourStartUnix, orderDirection: desc, first: 1, where: {pair: "${id}"}) {
      hourStartUnix,
      reserve0,
      reserve1,
      reserveUSD
    }
  }`;


  let response = await fetchFromGraph(UNISWAP_SUBGRAPH, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });

  let data = (await response.json()).data.pairHourDatas;

  if (data.length != 1) {
    throw 'Incorrect data returned from Uniswap';
  }
  return parseFloat(data[0].reserveUSD)/2/parseFloat(data[0].reserve0);
}

async function fetchAll(tokenSymbols: string[]): Promise<PriceData[]> {
  const symbol = tokenSymbols[0];
  const price = await fetchLatest(symbol);
  return [{ symbol, price }];
}

export default {
  fetchAll,
};
