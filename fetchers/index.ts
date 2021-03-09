import coingecko from "./coingecko";
import coinbase from "./coinbase";
import ecb from "./european-central-bank";
import uniswap from "./uniswap";
import { Fetcher } from "../types";

export default {
  coingecko,
  coinbase,
  uniswap,
  ecb,
} as { [name: string]: Fetcher };
