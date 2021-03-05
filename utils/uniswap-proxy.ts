import axios from "axios";
import _ from "lodash";

const UNISWAP_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

export async function getAllPairs(): Promise<any[]> {
  const pageSize = 100;
  let allPairsFetched = false,
      pageNr = 0,
      lastId = "",
      allPairs = [];

  while (!allPairsFetched) {
    console.log(
      `Getting ${pageSize} pairs on page ${pageNr}. Last id: ${lastId}`);

    const pairs = await getPairs(pageSize, lastId);

    if (pairs.length === 0) {
      allPairsFetched = true;
    } else {
      const lastItem: { id: string } = _.last(pairs);
      lastId = lastItem.id;
      pageNr++;
      allPairs = allPairs.concat(pairs);
    }
  }

  return allPairs;
}

async function getPairs(pageSize: number, lastId: string): Promise<any[]> {
  const query = `{
    pairs(
      first: ${pageSize},
      where: { id_gt: "${lastId}" }
    ) {
      id
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
      reserve0
      reserve1
      reserveUSD
      txCount
      totalSupply
      token0Price
      token1Price
      liquidityProviderCount
      volumeUSD
    }
  }`;

  const response = await executeQueryOnUniswapSubgraph(query);

  if (response.data !== undefined && response.data.pairs !== undefined) {
    return response.data.pairs;
  } else {
    console.log(response);
    return [];
  }
}

async function getMostPopularPairs() {
  const query = `{
    pairs(first: 1000, orderBy: volumeUSD, orderDirection: desc) {
      id
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
      reserve0
      reserve1
      reserveUSD
      txCount
      totalSupply
      token0Price
      token1Price
      liquidityProviderCount
      volumeUSD
    }
  }`;

  const response = await executeQueryOnUniswapSubgraph(query);

  if (response.data !== undefined && response.data.pairs !== undefined) {
    return response.data.pairs;
  } else {
    console.log(response);
    return [];
  }
}

async function executeQueryOnUniswapSubgraph(query: string): Promise<any> {
  const response = await axios.post(UNISWAP_SUBGRAPH, { query });
  return response.data;
}

export default {
  getAllPairs,
  getMostPopularPairs,
  executeQueryOnUniswapSubgraph,
};
