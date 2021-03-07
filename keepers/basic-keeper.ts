import proxy from "../utils/arweave-proxy";

const VERSION = "0.005";

async function keep(
  token: string,
  source: string,
  value: string
): Promise<void> {

  const tags = {
    app: "Limestone",
    version: VERSION,
    type: "data-latest",
    token: token,
    time: Date.now(),
    source: source,
    value: value,
  };

  const tx = await proxy.upload(tags, value);
  console.log(`Keeper tx (${token}): ${tx.id}`);
}

export default {
  keep,
};
