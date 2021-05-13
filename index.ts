import fs from "fs";
import yargs from "yargs";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Consola } from "consola"
import { Manifest } from "./types";
import Runner from "./runner";

const logger = require("./utils/logger")("index") as Consola;
const { hideBin } = require("yargs/helpers") as any;

async function start() {
  try {
    await main();
  } catch (e) {
    logger.error(e.stack);
    logger.info(
      "USAGE: yarn start --config <PATH_TO_CONFIG_FILE>");
  };
}

async function main(): Promise<void> {
  // Reading cli arguments
  const argv = yargs(hideBin(process.argv)).argv;
  const configFilePath = argv.config as string;

  // Validating cli arguments
  if (configFilePath === undefined || configFilePath === "") {
    throw new Error("Path to the config file cannot be empty");
  }

  const config = readJSON(configFilePath);
  const jwk = readJSON(config.arweaveKeysFile);
  const manifest = readJSON(config.manifestFile);

  // Running limestone-node with manifest
  const runner = await Runner.init({
    manifest,
    jwk,
    credentials: config.credentials,
  });
  runner.run();
}

function readJSON(path: string): any {
  const content = fs.readFileSync(path, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File "${path}" does not contain a valid JSON`);
  }
}

start();
