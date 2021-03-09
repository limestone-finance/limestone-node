import axios from "axios";
import { PriceDataSigned, Broadcaster } from "../types";

const PRICES_EP_URL = "https://api.limestone.finance/prices";

const lambdaBroadcaster: Broadcaster = {
  async broadcast(prices: PriceDataSigned[]): Promise<void> {

    // TODO: implement lambda endpoint for bulk prices uploading
    // await axios.post(PRICES_EP_URL, {
    //   prices,
    //   permawebTx,
    // });

    for (const price of prices) {
      await axios.post(PRICES_EP_URL, price);
    }
  },
};

export default lambdaBroadcaster;
