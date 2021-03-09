import axios from "axios";
import { PriceDataSigned, Broadcaster, TransactionId } from "../types";

const PRICES_EP_URL = "https://api.limestone.finance/prices";

const lambdaBroadcaster: Broadcaster = {
  async broadcast(prices: PriceDataSigned[],
    permawebTx: TransactionId, provider: string): Promise<void> {

    // TODO: implement lambda endpoint for bulk prices uploading
    // await axios.post(PRICES_EP_URL, {
    //   prices,
    //   permawebTx,
    // });

    for (const price of prices) {
      await axios.post(PRICES_EP_URL, {
        ...price,
        permawebTx,
        provider,
      });
    }
  },
};

export default lambdaBroadcaster;
