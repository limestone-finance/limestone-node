import consoleStamp from "console-stamp";
import uuid from "uuid-random";
import _ from "lodash";
import fetchers from "./fetchers";
import keepers from "./keepers";
import aggregators from "./aggregators";
import broadcaster from "./broadcasters/lambda-broadcaster";
import {
  PriceDataBeforeAggregation,
  PriceDataAfterAggregation,
  PriceDataSigned,
  PriceDataKeeped,
  Manifest,
  TokenConfig,
} from "./types";

//Format logs
consoleStamp(console, { pattern: "[HH:MM:ss.l]" });

const VERSION = "0.005";

async function fetchAll(
  manifest: Manifest
): Promise<PriceDataAfterAggregation[]> {

  const sources = groupTokensBySource(
    manifest.tokens,
    manifest.defaultSource);

  // Fetching token prices from all sources
  // And grouping them by token symbols
  const prices = {};
  for (const source in sources) {
    // Fetching
    const pricesFromSource = await fetchers[source].fetchAll(sources[source]);
    console.log(
      `Fetched prices in USD for ${pricesFromSource.length} `
      + `currencies from source: "${source}"`);

    // Grouping
    const timestamp = Date.now();
    for (const price of pricesFromSource) {
      if (prices[price.symbol] === undefined) {
        prices[price.symbol] = {
          id: uuid(), // Generating unique id for each price
          source: {},
          symbol: price.symbol,
          value: price.value, // value may be changed by agregator
          timestamp,
          version: VERSION,

          // TODO: implement getting real provider public key
          provider: "mock-provider",
        };
      }
      prices[price.symbol].source[source] = price.value;
    }
  }

  return calculateAggregatedValues(_.values(prices), manifest);
}

function calculateAggregatedValues(
  prices: PriceDataBeforeAggregation[],
  manifest: Manifest
): PriceDataAfterAggregation[] {
  return prices.map((p) =>
    aggregators[manifest.priceAggregator].getAggregatedValue(p));
}

// This function converts tokens from manifest to object with the following
// type: { <SourceName>: <Array of tokens to fetch from source> }
function groupTokensBySource(
  tokens: { [symbol: string]: TokenConfig },
  defaultSource: string[]
): object {
  const sources = {};

  for (const symbol in tokens) {
    const source = tokens[symbol].source;
    let sourcesForToken: string[];

    // If no source is defined for token
    // we use global source from manifest
    if (source === undefined) {
      if (defaultSource === undefined) {
        const errMsg =
          `Token source is not defined for "${symbol}"`
          + `and global source is not defined`;
        throw new Error(errMsg);
      } else {
        sourcesForToken = defaultSource;
      }
    } else {
      sourcesForToken = source;
    }

    for (const singleSource of sourcesForToken) {
      if (!sources[singleSource]) {
        sources[singleSource] = [symbol];
      } else {
        sources[singleSource].push(symbol);
      }
    }
  }

  return sources;
}

async function processAll(manifest: Manifest): Promise<void> {
  console.log("Processing tokens");

  const pricesFetched: PriceDataAfterAggregation[] =
    await fetchAll(manifest);

  for (const price of pricesFetched) {
    console.log(
      `Fetched price (${price.id}) : ${price.symbol} : ${price.value}`);

    // Signing price data
    console.log(`Signing price: ${price.id}`);
    const signedPrice: PriceDataSigned = signPrice(price);

    // Keeping on blockchain
    console.log(`Keeping on arweave blockchain: ${signedPrice.id}`);
    const { keep } = keepers.mock; // <- replace mock with basic to enable saving to arweave
    const priceKeeped: PriceDataKeeped = await keep(signedPrice);

    // Broadcasting
    console.log(`Broadcasting price ${priceKeeped.id}`);
    await broadcaster.broadcast(priceKeeped);
  }
}

// TODO: implement real signing
function signPrice(price: PriceDataAfterAggregation): PriceDataSigned {
  return {
    ...price,
    signature: "mock-signature",
  };
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
