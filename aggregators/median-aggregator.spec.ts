import {PriceDataAfterAggregation, PriceDataBeforeAggregation} from "../types";
import medianAggregator, {getMedianValue, getNonZeroValues} from "./median-aggregator";
import axios from "axios";

//mocking axios, so that "reportError" won't try
//to send errors on public api...
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.post.mockResolvedValue({});

describe('getNonZeroValues', () => {
  it('it should filter out non zero values', () => {
    //given
    const input: PriceDataBeforeAggregation = {
      id: "",
      source: {
        "src1": 555,
        "src2": 0,
        "src3": 12312312.3,
        "src4": 89.3334,
        "src5": -1,
        "src6": -0.0000000001,
        "src7": 0.0000000001
      },
      symbol: "BTC",
      timestamp: 0,
      version: ""
    };

    //when
    const result = getNonZeroValues(input);

    //then
    expect(result).toEqual([555,12312312.3,89.3334,0.0000000001])
  });
});

describe('getMedianValue', () => {
  it('should throw for empty array', () => {
    expect(() => getMedianValue([])).toThrow();
  });

  it('should properly calculate median for odd number of elements', () => {
    expect(getMedianValue([3, 7, 2, 6, 5, 4, 9])).toEqual(5);
    expect(getMedianValue([-3, 0, 3])).toEqual(0);
    expect(getMedianValue([3, 0, -3])).toEqual(0);
    expect(getMedianValue([-7, -5, -11, -4, -8])).toEqual(-7);
  });

  it('should properly calculate median for even number of elements', () => {
    expect(getMedianValue([3, 7, 2, 6, 5, 4])).toEqual(4.5);
    expect(getMedianValue([-3, 0])).toEqual(-1.5);
    expect(getMedianValue([0, -3])).toEqual(-1.5);
    expect(getMedianValue([-7, -5, -4, -8])).toEqual(-6);
  });
});

describe('medianAggregator', () => {
  it('should properly aggregate prices from different sources', () => {
    //given
    const input: PriceDataBeforeAggregation = {
      id: "",
      source: {
        "src1": 3,
        "src2": 7,
        "src3": 2,
        "src4": 6,
        "src5": 5,
        "src6": 9,
        "src7": 8
      },
      symbol: "BTC",
      timestamp: 0,
      version: ""
    };

    //when
    const result: PriceDataAfterAggregation = medianAggregator.getAggregatedValue(input);

    //then
    expect(result.value).toEqual(6);
  });

  it('should throw if all price values deviate too much from median', () => {
    //given
    const input: PriceDataBeforeAggregation = {
      id: "",
      source: {
        "src1": 555,
        "src2": 0,
        "src3": 12312312.3,
        "src4": 89.3334,
        "src5": -1,
        "src6": -0.0000000001,
        "src7": 0.0000000001
      },
      symbol: "BTC",
      timestamp: 0,
      version: ""
    };

    //then
    expect(() => medianAggregator.getAggregatedValue(input)).toThrow("Cannot get median value of an empty array");
  });

  it('should filter prices that deviate too much from the median value', () => {
    //given
    const input: PriceDataBeforeAggregation = {
      id: "",
      source: {
        "src1": 74,
        "src2": 80,
        "src3": 90,
        "src4": 100,
        "src5": 110,
        "src6": 120,
        "src7": 124
      },
      symbol: "BTC",
      timestamp: 0,
      version: ""
    };

    //when
    const result: PriceDataAfterAggregation = medianAggregator.getAggregatedValue(input);

    //then
    expect(result.value).toEqual((100 + 110) / 2);
  });
});
