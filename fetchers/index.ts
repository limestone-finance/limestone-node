import { Fetcher } from "../types";
import coingecko from "./coingecko";
import sushiswap from "./sushiswap";
import coinbase from "./coinbase";
import balancer from "./balancer";
import uniswap from "./uniswap";
import kyber from "./kyber";
import ecb from "./european-central-bank";

export default {
  coingecko,
  sushiswap,
  coinbase,
  balancer,
  uniswap,
  kyber,
  ecb,
} as { [name: string]: Fetcher };
