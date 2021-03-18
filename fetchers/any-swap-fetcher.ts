import { Consola } from "consola";
import graphProxy from "../utils/graph-proxy";
import { PriceDataFetched, Fetcher } from "../types";

const logger =
  require("../utils/logger")("fetchers/any-swap-fetcher") as Consola;

interface SymbolToPairId {
  [symbol: string]: string;
};

interface AnySwapFetcherConfig {
  subgraphUrl: string;
  symbolToPairIdObj: SymbolToPairId;
  sourceName: string;
};

export default {
  generateFetcher(config: AnySwapFetcherConfig): Fetcher {
    const fetcher = {
      async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
        const tokenIds = convertSymbolsToPairIds(
          tokenSymbols,
          config.symbolToPairIdObj,
          config.sourceName);

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
        const response = await graphProxy.executeQuery(
          config.subgraphUrl,
          query);

        // Building prices array
        const prices = [];
        for (const pair of response.data.pairs) {
          const value =
            parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0));
          prices.push({
            symbol: pair.token0.symbol,
            value,
          });
        }

        return prices;
      }
    };

    return fetcher;
  },
};

function convertSymbolsToPairIds(
  symbols: string[],
  symbolToPairId: SymbolToPairId,
  sourceName: string): string[] {
    const pairIds = [];

    for (const symbol of symbols) {
      const pairId = symbolToPairId[symbol];
      if (pairId === undefined) {
        logger.warn(
          `Token is not supported with ${sourceName} source: ${symbol}`);
      } else {
        pairIds.push(pairId);
      }
    }

    return pairIds;
  }
