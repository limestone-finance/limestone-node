import colors from "colors";
import graphProxy from "../../utils/graph-proxy";
import { PriceDataFetched, Fetcher } from "../../types";

const UNISWAP_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

const symbolToPairId: { [symbol: string]: string } =
  require("./uniswap-symbol-to-pair-id.json");

const uniswapFetcher: Fetcher = {
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

    // Fetching pairs data from uniswap subgraph
    const response = await graphProxy.executeQuery(UNISWAP_SUBGRAPH, query);

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
          `Token is not supported with uniswap source: ${symbol}`));
    } else {
      pairIds.push(pairId);
    }
  }

  return pairIds;
}

export default uniswapFetcher;
