import Transaction from "arweave/node/lib/transaction";
import ArweaveProxy from "../arweave/ArweaveProxy";
import {
  ArweaveTransactionTags,
  Keeper,
  PriceDataAfterAggregation,
} from "../types";

function checkAllPricesHaveSameTimestamp(prices: PriceDataAfterAggregation[]) {
  if (!prices || prices.length === 0) {
    throw new Error("Can not keep empty array of prices in Arweave");
  }

  const differentTimestamps = new Set(prices.map(price => price.timestamp));
  if (differentTimestamps.size !== 1) {
    throw new Error(`All prices should have same timestamps.
     Found ${differentTimestamps.size} different timestamps.`);
  }
}

async function prepareTransaction(
  prices: PriceDataAfterAggregation[],
  version: string,
  arweaveProxy: ArweaveProxy): Promise<Transaction> {

    checkAllPricesHaveSameTimestamp(prices);

    const tags: ArweaveTransactionTags = {
      app: "Limestone",
      type: "data",
      version,

      // Tags for HTTP headers
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",

      // All prices have the same timestamp
      timestamp: String(prices[0].timestamp),
    };

    // Adding AR price to tags if possible
    const arPrice = prices.find(p => p.symbol === "AR");
    if (arPrice !== undefined) {
      tags["AR"] = String(arPrice.value);
    }

    return await arweaveProxy.prepareUploadTransaction(tags, prices);
  };

export default {
  prepareTransaction,
} as Keeper;
