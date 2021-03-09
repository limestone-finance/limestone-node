import { Keeper, PriceDataSigned, TransactionId } from "../types";
import config from "../config";
import ArweaveProxy from "../utils/arweave-proxy";

interface SymbolsWithAggregatedValues {
  [symbol: string]: number,
};

const mockKeeper: Keeper = {
  async keep(
    prices: PriceDataSigned[],
    arweaveProxy: ArweaveProxy): Promise<TransactionId> {

    if (prices.length === 0) {
      throw new Error("Can not keep empty array of prices in arweave");
    }

    const tags = {
      app: "Limestone",
      type: "data",
      version: config.version,
      timestamp: prices[0].timestamp,
      symbols: getSymbolsWithAggregatedValues(prices), // <- TODO: change it, because it's serialized as [object Object]
    };

    const txId = await arweaveProxy.upload(tags, prices);

    return txId;
    // return tx.id;
  }
};


function getSymbolsWithAggregatedValues(
  prices: PriceDataSigned[]): SymbolsWithAggregatedValues {
  const result: SymbolsWithAggregatedValues = {};
  for (const price of prices) {
    result[price.symbol] = price.value;
  }
  return result;
}

export default mockKeeper;
