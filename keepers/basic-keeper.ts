import { Keeper, PriceDataAfterAggregation } from "../types";
import config from "../config";
import ArweaveProxy from "../utils/arweave-proxy";

interface Tags {
  [tag: string]: string,
};

const mockKeeper: Keeper = {
  async keep(
    prices: PriceDataAfterAggregation[],
    arweaveProxy: ArweaveProxy): Promise<string> {

    if (prices.length === 0) {
      throw new Error("Can not keep empty array of prices in arweave");
    }

    const tags: Tags = {
      app: "Limestone",
      type: "data",
      version: config.version,
      timestamp: String(prices[0].timestamp),
    };

    // Adding AR price to tags if possible
    const arPrice = prices.find(p => p.symbol === "AR");
    if (arPrice !== undefined) {
      tags["AR"] = String(arPrice.value);
    }

    const txId = await arweaveProxy.upload(tags, prices);

    return txId;
    // return tx.id;
  }
};

export default mockKeeper;
