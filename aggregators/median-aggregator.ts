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
  arr = arr.sort();

  if (arr.length % 2 === 0) {
    // TODO: maybe we should return mean value of two values in center
    return arr[arr.length / 2];
  } else {
    return arr[(arr.length - 1) / 2];
  }
}

export default medianAggregator;
