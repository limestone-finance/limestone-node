import proxy from "../utils/arweave-proxy";
import { Keeper, PriceDataSigned, PriceDataKeeped } from "../types";

const mockKeeper: Keeper = {
  async keep(price: PriceDataSigned): Promise<PriceDataKeeped> {
    // TODO: think about naming unification
    // for example change names:
    // time -> timestamp
    // token -> symbol
    const tags = {
      app: "Limestone",
      version: price.version,
      type: "data-latest",
      token: price.symbol,
      time: Date.now(),
      source: price.source,
      value: price.value,
    };

    const tx = await proxy.upload(tags, price.value);
    console.log(`Keeper tx (${tags.token}): ${tx.id}`);

    return {
      ...price,
      permawebTx: tx.id,
    };
  }
};

export default mockKeeper;
