import { Keeper, PriceDataAfterAggregation } from "../types";

const mockKeeper: Keeper = {
  async keep(_prices: PriceDataAfterAggregation[]): Promise<string> {
    return "mock-permaweb-tx";
  }
};

export default mockKeeper;
