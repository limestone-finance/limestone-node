import axios from "axios";
import colors from "colors";
import { PriceDataFetched, Fetcher } from "../../types";

const CoinGecko = require("coingecko-api");

const ETH_PAIRS_URL = "https://api.kyber.network/api/tokens/pairs";

const kyberFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching pairs data from kyber api
    const response = await axios.get(ETH_PAIRS_URL);
    const pairs = response.data;

    // Building prices array
    const ethPrice = await getETHPriceInUSD();

    const prices: PriceDataFetched[] = [];
    for (const symbol of tokenSymbols) {
      const pair = pairs["ETH_" + symbol];

      if (pair === undefined) {
        console.warn(
          colors.bold.bgYellow(
            `Token is not supported with kyber source: ${symbol}`));
      } else {
        prices.push({
          symbol,
          value: ethPrice * pair.currentPrice,
        });
      }
    }

    return prices;
  }
};

// TODO: after limestone-api update we can
// use limestone-api here instead of coingecko
async function getETHPriceInUSD(): Promise<number> {
  const ethId = "ethereum";
  const coinGeckoClient = new CoinGecko();
  const response = await coinGeckoClient.simple.price({ ids: [ethId] });
  return Number(response.data[ethId].usd);
}

export default kyberFetcher;
