import axios from "axios";
import { PriceDataKeeped, Broadcaster } from "../types";

// TODO: connect limestone.finance domain and change URL
const PRICED_EP_URL = "https://3t0z836dv2.execute-api.eu-north-1.amazonaws.com/default/pricesHttpEndpoint";

const lambdaBroadcaster: Broadcaster = {
  async broadcast(price: PriceDataKeeped): Promise<void> {
    await axios.post(PRICED_EP_URL, price);
  },
};

export default lambdaBroadcaster;
