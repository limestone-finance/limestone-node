import axios from "axios";
import fetchers from "../../src/fetchers/index"
import * as fs from "fs";
import LimestoneApi from "limestone-api";
import {GetPriceOptions, PriceData} from "limestone-api/lib/types";
import {MockProxy} from 'jest-mock-extended';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('limestone-api');
const mockedApi = LimestoneApi as MockProxy<typeof LimestoneApi>

describe("binance fetcher", () => {
  const sut = fetchers["binance"];
  const response = fs.readFileSync("./src/fetchers/binance/example-binance-response.json", "utf-8");
  const exampleResponse = JSON.parse(response);

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({data: exampleResponse});

    // meh...
    // https://javascript.plainenglish.io/mocking-ts-method-overloads-with-jest-e9c3d3f1ce0c
    // https://github.com/marchaos/jest-mock-extended/issues/20#issuecomment-609996792
    type GetSinglePrice = (symbol: string, opts?: GetPriceOptions) => Promise<PriceData>;
    (mockedApi.getPrice as GetSinglePrice) = jest.fn((symbol: string) => {
      return Promise.resolve({
        symbol: "USDT",
        provider: "prov",
        value: 1.002,
        permawebTx: "sdf",
        timestamp: 111111
      });
    });
  });


  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["BAL", "USDC", "WETH"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "BAL",
        "value": 31.821516,
      },
      {
        "symbol": "USDC",
        "value": 1.0002966,
      },
    ]);

  });
});

