import { Fetcher } from "../types";
import coingecko from "./coingecko";
import sushiswap from "./sushiswap";
import coinbase from "./coinbase";
import balancer from "./balancer";
import uniswap from "./uniswap";
import bitmart from "./bitmart";
import binance from "./binance";
import kyber from "./kyber";
import huobi from "./huobi";
import ecb from "./ecb";

export default {
  coingecko,
  sushiswap,
  coinbase,
  balancer,
  uniswap,
  bitmart,
  binance,
  kyber,
  huobi,
  ecb,
} as { [name: string]: Fetcher };
