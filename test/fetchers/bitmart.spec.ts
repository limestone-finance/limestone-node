import axios from "axios";
import fetchers from "../../src/fetchers/index"
import * as fs from "fs";
import LimestoneApi from "limestone-api";
import {MockProxy} from "jest-mock-extended";
import {GetPriceOptions, PriceData} from "limestone-api/lib/types";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('limestone-api');
const mockedApi = LimestoneApi as MockProxy<typeof LimestoneApi>

describe("bitmart fetcher", () => {
  const sut = fetchers["bitmart"];
  const response = fs.readFileSync("./src/fetchers/bitmart/bitmart-example-ar-response.json", "utf-8");
  const exampleResponse = JSON.parse(response);

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({data: exampleResponse});
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
    const result = await sut.fetchAll(["AR", "ETH", "BTC"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "AR",
        "value": 13.208965200000002,
      }
    ]);

  });
});

