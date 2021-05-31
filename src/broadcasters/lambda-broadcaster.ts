import axios from "axios";
import {Broadcaster, PriceDataSigned} from "types";
import mode from "mode";

// "lambda" as this is deployed on AWS Lambda
const lambdaBroadcaster: Broadcaster = {

  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    await axios.post(mode.broadcasterUrl, prices);
  },
};

export default lambdaBroadcaster;
