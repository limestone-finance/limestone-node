import _ from "lodash";
import {
  Aggregator,
  PriceDataBeforeAggregation,
  PriceDataAfterAggregation,
} from "../types";

const medianAggregator: Aggregator = {
  getAggregatedValue(
    price: PriceDataBeforeAggregation): PriceDataAfterAggregation {
    return {
      ...price,
      value: getMedianValue(_.values(price.source)),
    };
  },
};

function getMedianValue(arr: number[]): number {
  arr = arr.sort((a, b) => a - b);

  if (arr.length === 0) {
    throw new Error("Can not get median value of an empty array");
  }

  const middle = Math.floor(arr.length / 2);

  if (arr.length % 2 === 0) {
    return (arr[middle] + arr[middle - 1]) / 2;
  } else {
    return arr[middle];
  }
}

export default medianAggregator;
