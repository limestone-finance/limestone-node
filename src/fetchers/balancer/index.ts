import axios from "axios";
import { PriceDataFetched, Fetcher, Credentials } from "../../types";

const URL = "https://api.covalenthq.com/v1/1/address/balancer.eth/stacks/balancer/balances/";

const balancerFetcher: Fetcher = {
  async fetchAll(
    tokenSymbols: string[],
    opts?: { credentials: Credentials }): Promise<PriceDataFetched[]> {
      if (opts === undefined || opts.credentials.covalentApiKey === undefined) {
        throw new Error(
          "To use balancer fetcher you should pass --covalent-key");
      }

      // Fetching balancer data from covalent api
      const response = await axios.get(URL, {
        params: { "key": opts.credentials.covalentApiKey },
      });

      // Picking prices from response
      const pricesObj: { [symbol: string]: number } = {};
      const balances: any[] = response.data.data.balancer.balances;
      for (const balance of balances) {
        for (const asset of balance.assets) {
          const assetSymbol: string = asset["contract_ticker_symbol"];
          if (tokenSymbols.includes(assetSymbol)) {
            pricesObj[assetSymbol] = asset.quote_rate;
          }
        }
      }

      // Building prices array
      const prices: PriceDataFetched[] = [];
      for (const symbol in pricesObj) {
        prices.push({
          symbol,
          value: pricesObj[symbol],
        });
      }

      return prices;
    },
};

export default balancerFetcher;
