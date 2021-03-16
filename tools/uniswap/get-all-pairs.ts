import uniswapProxy from "./uniswap-proxy";

// This script can be used to fetch all available uniswap pairs from the graph
// USAGE: ts-node tools/uniswap/get-all-pairs.ts > uniswap-all-pairs.json

main();

async function main() {
  const pairs = await uniswapProxy.getAllPairs();
  console.log(JSON.stringify(pairs, null, 2));
}
