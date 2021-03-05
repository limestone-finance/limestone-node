import consoleStamp from "console-stamp";
import fetchers from "./fetchers";
import keeper from "./keepers/basic-keeper";
import { PriceData, Manifest, TokenConfig } from "./types";

//Format logs
consoleStamp(console, { pattern: "[HH:MM:ss.l]" });

async function fetchAll(
  tokens: TokenConfig[],
  defaultSource: string[]
): Promise<PriceData[]> {

  // Grouping tokens by source
  const sources = {};
  for (const token of tokens) {
    let sourcesForToken: string[];

    // If no source is defined for token
    // we use global source from manifest
    if (token.source === undefined) {
      if (defaultSource === undefined) {
        const errMsg =
          `Token source is not defined for "${token.symbol}"`
          + `and global source is not defined`;
        throw new Error(errMsg);
      } else {
        sourcesForToken = defaultSource;
      }
    } else {
      sourcesForToken = token.source;
    }

    for (const source of sourcesForToken) {
      if (!sources[source]) {
        sources[source] = [token.symbol];
      } else {
        sources[source].push(token.symbol);
      }
    }
  }

  // Fetching token prices and merging them into a single array
  let result = [];
  for (const source in sources) {
    let pricesFromSource = await fetchers[source].fetchAll(sources[source]);
    console.log(`Fetched USD prices for ${pricesFromSource.length} currencies from ${source}`);

    // Adding source to each fetched price
    pricesFromSource = pricesFromSource.map((p: PriceData) => {
      return { ...p, source };
    });

    result = result.concat(pricesFromSource);
  }

  return result;
}

async function processAll(manifest: Manifest): Promise<void> {
  console.log("Processing tokens");

  const pricesFetched = await fetchAll(manifest.tokens, manifest.source);

  for (const price of pricesFetched) {
    // TODO implement broadcasting

    // TODO implement keeping on Arweave blockchain
    // await keeper.keep(price.symbol, price.source, price.price);

    console.log(`Fetched price: ${price.symbol} : ${price.price}`);
    console.log("Keeping on arweave blockchain [skipped]");
  }
}

function run(manifest: Manifest): void {
  console.log("Running limestone-node with manifest: ");
  console.log(JSON.stringify(manifest));

  const runIteration = () => {
    processAll(manifest);
  };

  runIteration(); // Start immediately then repeat in manifest.interval
  setInterval(runIteration, manifest.interval);
}

export default {
  run,
};
