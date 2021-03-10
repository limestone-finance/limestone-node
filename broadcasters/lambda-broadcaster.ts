import axios from "axios";
import { PriceDataSigned, Broadcaster } from "../types";

const PRICES_EP_URL = "https://api.limestone.finance/prices";

const lambdaBroadcaster: Broadcaster = {
  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    await axios.post(PRICES_EP_URL, prices);
  },
};

export default lambdaBroadcaster;
