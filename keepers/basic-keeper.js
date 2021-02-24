const proxy = require("../utils/arweave-proxy.js");

const VERSION = "0.005";

async function keep(token, source, value) {
  let tags = {
    app: "Limestone",
    version: VERSION,
    type: "data-latest",
    token: token,
    time: new Date().getTime(),
    source: source,
    value: value
  };

  let tx = await proxy.upload(tags, value);
  console.log("Keeper tx (" + token + "): " + tx.id);
}

//EXPORTS:
module.exports.keep = keep;



