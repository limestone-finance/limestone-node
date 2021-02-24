//const Smartweave = require('smartweave');
const Arweave = require('arweave/node');
const fetch = require('isomorphic-fetch');
//TODO: Read it from parameter
const PRIVATE_KEY = require('../.secret.json');
const ARQL =  require('arql-ops');
const LIME_TOKEN = 'q2v4Msum6oeNRkSGfaM3E3RU6RCJ17T7Vm9ltMDEv4M';

//Value to be updated after calculations
const FEE = 1000000;

var recentHeight;

async function getCurrentHeight() {
  if (!recentHeight) {
    let info = await arweave.network.getInfo();
    recentHeight = parseInt(info.height);
  }
  console.log("Recent height: " + recentHeight);
  return recentHeight;
}

const arweave = Arweave.init({
  host: 'arweave.net',// Hostname or IP address for a Arweave host
  port: 443,          // Port
  protocol: 'https',  // Network protocol http or https
  timeout: 60000,     // Network request timeouts in milliseconds
  logging: false,     // Enable network request logging
});


async function upload(tags, data) {
  let uploadTx = await arweave.createTransaction({data: JSON.stringify(data)}, PRIVATE_KEY);
  Object.keys(tags).forEach(function(key) {
    uploadTx.addTag(key, tags[key]);
  });
  await arweave.transactions.sign(uploadTx, PRIVATE_KEY);
  const response = await arweave.transactions.post(uploadTx);
  if (response.data) {
    console.log(response.data);
  }
  //await payFee();

  return uploadTx;
}

async function payFee() {
  // let address = await arweave.wallets.jwkToAddress(PRIVATE_KEY);
  // let balance = await arweave.wallets.getBalance(address);
  // console.log("Client " + address + " " + balance);
  //
  // let tokenState = await Smartweave.readContract(arweave, LIME_TOKEN);
  //
  // const holder = Smartweave.selectWeightedPstHolder(tokenState.balances);
  // console.log("Holder: " + holder);
  //
  // const tx = await arweave.createTransaction({ target: holder, quantity: FEE.toString() }, PRIVATE_KEY);
  // await arweave.transactions.sign(tx, PRIVATE_KEY);
  // let response = await arweave.transactions.post(tx);
  //
  // console.log("Payment tx: " + tx.id);
  // console.log(response.data);
  // if (response.data.error) {
  //   console.log(response.data.error.validation);
  // }
}


async function find(parameters) {
  let arqlParameters = Object.keys(parameters).reduce((acc, key) => {
    acc.push(ARQL.equals(key, parameters[key]));
    return acc;
  }, []);
  let myQuery = ARQL.and(... arqlParameters);
  let results = await arweave.arql(myQuery);
  return results;
}

async function findLastTx(parameters) {
  let startBlock = (await getCurrentHeight()) - 200;

  let query = `{ transactions(
  first: 1,
  tags: [
      { name: "app", values: ["${parameters.app}"] },
      { name: "version", values: ["${parameters.version}"] },
      { name: "id", values: ["${parameters.id}"] }
    ],
    block: {min: ${startBlock}},
    sort: HEIGHT_DESC
    ) {
      edges {
        node {
          id,
          block {
            height
          },
          tags {
            name
            value
          }
        }
      }
    }
  }
`;

  let response = await fetch("https://arweave.dev/graphql", {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });

  let res = await response.json();
  console.log(res);
  if (res.data) {
    let tags = res.data.transactions.edges[0].node.tags;
    let result = {};
    tags.forEach(tag => {
      if (tag.name === "time") {
        result.time = new Date(parseInt(tag.value))
      }
    });
    return result;
  } else {
    throw Error("No data returned from Arweave Graph QL");
  }

}


async function getData(tx) {
  let rawData = await arweave.transactions.getData(tx, {decode: true, string: true});
  let data = JSON.parse(rawData);
  return data;
}


async function getTags(tx) {
  let transaction = await arweave.transactions.get(tx);
  let tags = {};
  transaction.get('tags').forEach(tag => {
    let key = tag.get('name', {decode: true, string: true});
    let value = tag.get('value', {decode: true, string: true});
    //console.log(`${key} : ${value}`);
    tags[key] = value;
  });
  return tags;
}


async function findAndDownload(token, source) {
  let txs = await find(token, source);
  console.log("TX found: " + txs[0]);
  let data = await getData(txs[0]);

  return data;
}

async function getStatus(tx) {
  let status = await arweave.transactions.getStatus(tx);
  console.log(status);
  return status
}

//EXPORTS:
module.exports.upload = upload;
module.exports.findAndDownload = findAndDownload;
module.exports.find = find;
module.exports.findLastTx = findLastTx;
module.exports.getData = getData;
module.exports.getTags = getTags;
module.exports.getStatus = getStatus;
