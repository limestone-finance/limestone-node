import colors from "colors";
import graphProxy from "../../utils/graph-proxy";
import { PriceDataFetched, Fetcher } from "../../types";

// TODO: maybe we should refactor this code in future
// because it contains many duplications with uniswap fetcher.
// We can create a base fetcher for uni- and sushiswap
// and initialise it with different subgraph urls and names

const SUSHISWAP_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

const symbolToPairId: { [symbol: string]: string } =
  require("./sushiswap-symbol-to-pair-id.json");

const sushiswapFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
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

    // Fetching pairs data from sushiswap subgraph
    const response = await graphProxy.executeQuery(SUSHISWAP_SUBGRAPH, query);

    // Building prices array
    const prices = [];
    for (const pair of response.data.pairs) {
      prices.push({
        symbol: pair.token0.symbol,
        value: parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0)),
      });
    }

    return prices;
  }
};

function convertSymbolsToPairIds(symbols: string[]): string[] {
  const pairIds = [];

  for (const symbol of symbols) {
    const pairId = symbolToPairId[symbol];
    if (pairId === undefined) {
      console.warn(
        colors.bold.bgYellow(
          `Token is not supported with sushiswap source: ${symbol}`));
    } else {
      pairIds.push(pairId);
    }
  }

  return pairIds;
}

export default sushiswapFetcher;
