import uniswapProxy from "../../utils/uniswap-proxy";

main();

async function main() {
  const tokens = {};
  const pairs = await uniswapProxy.getMostPopularPairs();

  for (const pair of pairs) {
    const symbol = pair.token0.symbol;
    if (tokens[symbol] === undefined) {
      tokens[symbol] = pair.id;
    }
  }

  console.log(JSON.stringify(tokens, null, 2));
}
