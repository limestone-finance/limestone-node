import colors from "colors";
import uniswapProxy from "../../utils/uniswap-proxy";
import { PriceData } from "../../types";
import symbolToPairId from "./uniswap-symbol-to-pair-id.json";

async function fetchAll(tokenSymbols: string[]): Promise<PriceData[]> {
  const tokenIds = convertSymbolsToPairIds(tokenSymbols);

  const query = `{
    pairs(where: { id_in: ${JSON.stringify(tokenIds)} }) {
      token0 {
        symbol
      }
      reserve0
      reserveUSD
    }
  }`;

  // Fetching pairs data from uniswap subgraph
  const response = await uniswapProxy.executeQueryOnUniswapSubgraph(query);

  // Building prices array
  const prices = [];
  for (const pair of response.data.pairs) {
    const price = parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0));
    prices.push({
      symbol: pair.token0.symbol,
      price,
    });
  }

  return prices;
}

function convertSymbolsToPairIds(symbols: string[]): string[] {
  const pairIds = [];

  for (const symbol of symbols) {
    const pairId = symbolToPairId[symbol];
    if (pairId === undefined) {
      console.warn(
        colors.bold.bgYellow(
          `Token is not supported with uniswap source: ${symbol}`));
    } else {
      pairIds.push(pairId);
    }
  }

  return pairIds;
}


export default {
  fetchAll,
};
