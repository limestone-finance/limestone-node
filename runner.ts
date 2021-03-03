import consoleStamp from "console-stamp";
import fetchers from "./fetchers";
import keeper from "./keepers/basic-keeper";

//Format logs
consoleStamp(console, { pattern: "[HH:MM:ss.l]" });

let config: any;

async function uploadData(config) {
  // let fetchingConfig = await connector.getData(config.tx);
  // console.log(fetchingConfig);
  // let args = JSON.parse(fetchingConfig);
  // let dataBundle = null;
  // let dataLatest = null;
  // try {
  //   dataBundle = await fetchers[config.source].fetchBundle(...args);
  //   dataLatest = await fetchers[config.source].fetchLatest(...args);
  // } catch (err) {
  //   console.log("Error fetching data:");
  //   console.log(err);
  //   return;
  // }
  // if (dataBundle) {
  //   let tags = {
  //     app: "Limestone",
  //     version: VERSION,
  //     type: "dataset-content",
  //     token: config.token,
  //     id: config.id,
  //     time: new Date().getTime(),
  //     source: config.source
  //   };
  //   let tx = await connector.upload(tags, dataBundle);
  //   console.log("Data bundle tx (" + config.token + "): " + tx.id);
  // }
  // if (dataLatest) {
  //   let tags = {
  //     app: "Limestone",
  //     version: VERSION,
  //     type: "data-latest",
  //     token: config.token,
  //     id: config.id,
  //     time: new Date().getTime(),
  //     source: config.source,
  //     value: dataLatest
  //   };
  //   let tx = await connector.upload(tags, dataLatest);
  //   console.log("Data spot tx (" + config.token + "): " + tx.id);
  // }
}

async function process(token) {

  //TODO: Iterate across all the sources
  let source = token.source[0];
  console.log("Processing token: " + token.symbol);
  let price = null;
  try {
    price = await fetchers[source].fetch(token.symbol);
  } catch (err) {
    console.log("Error fetching price: " + token.symbol);
    console.log(err);
    return;
  }
  console.log("Fetched price " + token.symbol + " : " + price);

  //TODO: Handle retrials in case of Arweave downtime
  await keeper.keep(token.symbol, source, price);
}

async function fetchAll(tokens) {
  // Grouping tokens by source
  const sources = {};
  for (const token of tokens) {
    for (const source of token.source) { // token.source is an array
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
    pricesFromSource = pricesFromSource.map(p => {
      return { ...p, source };
    });

    result = result.concat(pricesFromSource);
  }

  return result;
}

async function processAll() {
  console.log("Processing tokens");

  const pricesFetched = await fetchAll(config.tokens);

  for (const price of pricesFetched) {
    // TODO implement keeping on Arweave blockchain
    // await keeper.keep(price.symbol, price.source, price.price);

    console.log(`Fetched price: ${price.symbol} : ${price.price}`);
    console.log("Keeping on arweave blockchain [skipped]");
  }
}

async function run(_config) {
  config = _config;
  console.log("Running limestone-node with config:");
  console.log(JSON.stringify(config));

  processAll(); // Start immediately then repeat in config.interval
  setInterval(processAll, config.interval);
}

export default {
  run,
};
