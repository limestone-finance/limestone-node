import { Consola } from "consola";
import _ from "lodash";
import {
  Aggregator,
  PriceDataBeforeAggregation,
  PriceDataAfterAggregation,
} from "../types";

const logger =
  require("../utils/logger")("aggregators/median-aggregator") as Consola;

const MAX_DEVIATION = 20; // perecents

const medianAggregator: Aggregator = {
  getAggregatedValue(price: PriceDataBeforeAggregation
    ): PriceDataAfterAggregation {
      const values = _.values(price.source);
      const median = getMedianValue(values);

      for (const value of values) {
        const deviation = (Math.abs(value - median) / median) * 100;
        if (deviation > MAX_DEVIATION) {
          logger.warn(`Value ${value} has too big deviation from median`, price);
        }
      }

      return {
        ...price,
        value: median,
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
