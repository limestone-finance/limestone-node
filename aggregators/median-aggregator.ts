import { Consola } from "consola";
import _, { values } from "lodash";
import {
  Aggregator,
  PriceDataBeforeAggregation,
  PriceDataAfterAggregation,
} from "../types";

const logger =
  require("../utils/logger")("aggregators/median-aggregator") as Consola;

const MAX_DEVIATION = 25; // perecents

const medianAggregator: Aggregator = {
  getAggregatedValue(price: PriceDataBeforeAggregation
    ): PriceDataAfterAggregation {
      const initialValues = getNonZeroValues(price);
      const initialMedian = getMedianValue(initialValues);

      // Filtering out values based on deviation from the initial median
      const finalValues = [];
      for (const value of initialValues) {
        const deviation =
          (Math.abs(value - initialMedian) / initialMedian) * 100;
        if (deviation > MAX_DEVIATION) {
          logger.warn(
            `Value ${value} has too big deviation (${deviation}) from median. `
            + `Symbol: ${price.symbol}. Skipping...`,
            price);
        } else {
          finalValues.push(value);
        }
      }

      return {
        ...price,
        value: getMedianValue(finalValues),
      };
    },
};

function getNonZeroValues(price: PriceDataBeforeAggregation): number[] {
    const values: number[] = [];

    for (const source of _.keys(price.source)) {
      const value = price.source[source];
      if (value <= 0) {
        logger.warn(
          `Incorrect price value (<= 0) for source: ${source}`,
          price);
      } else {
        values.push(value);
      }
    }

    return values;
  }

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
