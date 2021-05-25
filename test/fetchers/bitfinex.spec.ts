import axios from "axios";
import {Credentials} from "../../src/types";
import fetchers from "../../src/fetchers/index"
import * as fs from "fs";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("bitfinex fetcher", () => {
  const sut = fetchers["bitfinex"];
  const response = fs.readFileSync("./src/fetchers/bitfinex/bitfinex-example-response.json", "utf-8");
  const exampleResponse = JSON.parse(response);

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({data: exampleResponse});
  });

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["USDT", "ETH", "DOGE", "UST"]);

    //then
    // TODO: no value for DOGE and USDT?
    expect(result).toEqual([
      {
        "symbol": "ETH",
        "value": 2615.68658095,
      },
      {
        "symbol": "UST",
        "value": 1.0012,
      },
    ]);

  });
});

