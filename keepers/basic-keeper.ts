import proxy from "../utils/arweave-proxy";
import { Keeper, PriceDataSigned, TransactionId } from "../types";

const mockKeeper: Keeper = {
  async keep(prices: PriceDataSigned[]): Promise<TransactionId> {
    // TODO: think about naming unification
    // for example change names:
    // time -> timestamp
    // token -> symbol

    // TODO implement batch keeping
    // const tags = {
    //   app: "Limestone",
    //   version: price.version,
    //   type: "data-latest",
    //   token: price.symbol,
    //   time: Date.now(),
    //   source: price.source,
    //   value: price.value,
    // };

    // const tx = await proxy.upload(tags, price.value);
    // console.log(`Keeper tx (${tags.token}): ${tx.id}`);

    // return {
    //   ...price,
    //   permawebTx: tx.id,
    // };

    return "mock-tx-id";
  }
};

export default mockKeeper;
