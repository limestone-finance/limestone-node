import axios from "axios";
import mode from "../mode";
import { PriceDataSigned, Broadcaster } from "../types";

const lambdaBroadcaster: Broadcaster = {
  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    await axios.post(mode.broadcasterUrl, prices);
  },
};

export default lambdaBroadcaster;
