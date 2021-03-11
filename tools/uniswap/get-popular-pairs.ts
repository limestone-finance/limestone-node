import uniswapProxy from "./uniswap-proxy";

main();

async function main() {
  const pairs = await uniswapProxy.getMostPopularPairs();
  console.log(JSON.stringify(pairs, null, 2));
}
