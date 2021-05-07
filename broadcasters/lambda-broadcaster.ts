import axios from "axios";
import config from "../config";
import { PriceDataSigned, Broadcaster } from "../types";

const lambdaBroadcaster: Broadcaster = {
  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    await axios.post(config.broadcasterUrl, prices);
  },
};

export default lambdaBroadcaster;
