import { Keeper, PriceDataSigned, PriceDataKeeped } from "../types";

const mockKeeper = {
  async keep(price: PriceDataSigned): Promise<PriceDataKeeped> {
    return {
      ...price,
      permawebTx: "mock-permaweb-tx",
    };
  }
};

export default mockKeeper;
