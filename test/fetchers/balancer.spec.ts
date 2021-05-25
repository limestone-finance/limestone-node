import axios from "axios";
import {Credentials} from "../../src/types";
import fetchers from "../../src/fetchers/index"
import * as fs from "fs";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("balancer fetcher", () => {
  const sut = fetchers["balancer"];
  const response = fs.readFileSync("./src/fetchers/balancer/example-covalent-response.json", "utf-8");
  const exampleResponse = JSON.parse(response);

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({data: exampleResponse});
  });

  it('should throw if no covalent api key passed in options', async () => {
    await expect(sut.fetchAll([])).rejects.toThrowError();
    await expect(sut.fetchAll([], {credentials: {}})).rejects.toThrowError();
    await expect(sut.fetchAll([], {credentials: {infuraProjectId: ""}})).rejects.toThrowError();
  });

  it('should properly fetch data', async () => {
    //given
    const credentials: Credentials = {
      covalentApiKey: "someKey;"
    };

    //when
    const result = await sut.fetchAll(["BAL", "USDC", "WETH"], {credentials});

    //then
    expect(result).toEqual([
      {
        "symbol": "BAL",
        "value": 46.78163,
      },
      {
        "symbol": "WETH",
        "value": 1824.6058,
      },
      {
        "symbol": "USDC",
        "value": 1.0029249,
      },
    ]);

  });
});

