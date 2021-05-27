import {GetPriceOptions, PriceData} from "limestone-api/lib/types";
import LimestoneApi from "limestone-api";
import {MockProxy} from "jest-mock-extended";
import axios from "axios";

export type GetSinglePrice = (symbol: string, opts?: GetPriceOptions) => Promise<PriceData>;

export function mockLimestoneApiPrice(value: number, symbol: string = "USDT", ) {
  jest.mock('limestone-api');
  const mockedApi = LimestoneApi as MockProxy<typeof LimestoneApi>

  (mockedApi.getPrice as GetSinglePrice) = jest.fn((symbol: string) => {
    return Promise.resolve({
      symbol: symbol,
      provider: "prov",
      value: value,
      permawebTx: "sdf",
      timestamp: 111111
    });
  });
}

export function mockFetcherResponse(pathToResponseFile: string) {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const exampleResponse = require(pathToResponseFile);
  mockedAxios.get.mockResolvedValue({data: exampleResponse});
  mockedAxios.post.mockResolvedValue({data: exampleResponse});
}


//TODO: find out why this does not work...
export function mockFetcherProxy(proxyModule: string, pathToResponseFile: string) {
  jest.mock(proxyModule, () => {
    return jest.fn().mockImplementation(() => {
      return {
        getExchangeRates: () => {
          const exampleResponse = require(pathToResponseFile);

          return Promise.resolve({
            data: exampleResponse
          });
        }
      }
    });
  });
}
