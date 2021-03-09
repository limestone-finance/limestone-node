import { Keeper, PriceDataSigned, TransactionId } from "../types";

const mockKeeper: Keeper = {
  async keep(_prices: PriceDataSigned[]): Promise<TransactionId> {
    return "mock-permaweb-tx";
  }
};

export default mockKeeper;
