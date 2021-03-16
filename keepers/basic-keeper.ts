import Transaction from "arweave/node/lib/transaction";
import ArweaveProxy from "../utils/arweave-proxy";
import {
  ArweaveTransactionTags,
  Keeper,
  PriceDataAfterAggregation,
} from "../types";

const { version } = require("../package.json") as any;

async function prepareTransaction(
  prices: PriceDataAfterAggregation[],
  arweaveProxy: ArweaveProxy): Promise<Transaction> {
    if (prices.length === 0) {
      throw new Error("Can not keep empty array of prices in arweave");
    }

    const tags: ArweaveTransactionTags = {
      app: "Limestone",
      type: "data",
      version,

      // all prices should have the same timestamp
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
