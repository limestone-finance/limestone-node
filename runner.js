//Format logs
require('console-stamp')(console, '[HH:MM:ss.l]');

//TODO: consider moving to fetcher folder and create a lookup module there
const fetchers = {
  coingecko: require("./fetchers/coingecko-fetcher.js"),
  uniswap: require("./fetchers/uniswap-fetcher.js"),
  coinbase: require("./fetchers/coinbase-fetcher.js"),
  ecb: require("./fetchers/european-central-bank-fetcher.js")
};

const keeper = require('./keepers/basic-keeper');



const MINING_INTERVAL = 300; //In seconds

var lastMinedTimes = {};

var config;

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

async function processAll() {
  console.log("Processing tokens");
  config.tokens.forEach(process);


  setTimeout(processAll, config.interval);
}

async function run(_config) {
  config = _config;
  console.log("Running limestone-node with config:");
  console.log(config);
  await processAll();
}

//EXPORTS:
module.exports.run = run;

