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
      "USAGE: yarn start --manifest <PATH_TO_MANIFEST_FILE_WITH_VALID_JSON> --jwk <PATH_TO_JWK_FILE> [--infura-key <INFURA_API_KEY>] [--covalent-key <COVALENT_API_KEY>]");
  };
}

async function main(): Promise<void> {
  // Reading cli arguments
  const argv = yargs(hideBin(process.argv)).argv,
        manifestFilePath = argv.manifest,
        jwkFilePath = argv.jwk,
        infuraApiKey = argv["infura-key"] as string | undefined,
        covalentApiKey = argv["covalent-key"] as string | undefined;


  // Validating cli arguments
  if (manifestFilePath === undefined || manifestFilePath === "") {
    throw new Error("Path to manifest file cannot be empty");
  }
  if (jwkFilePath === undefined || jwkFilePath === "") {
    throw new Error("Path to jwk file cannot be empty");
  }

  // Reading and parsing manifest file
  let manifest: Manifest,
      jwk: JWKInterface;
  const manifestFileContent: string =
    fs.readFileSync(String(manifestFilePath), "utf-8");
  const jwkFileContent: string =
    fs.readFileSync(String(jwkFilePath), "utf-8");
  try {
    manifest = JSON.parse(manifestFileContent);
    jwk = JSON.parse(jwkFileContent);
  } catch (e) {
    throw new Error("Manifest file and jwk file must be valid JSONs");
  }

  // Running limestone-node with manifest
  const runner = await Runner.init({
    manifest,
    jwk,
    infuraApiKey,
    covalentApiKey,
  });
  runner.run();
}

start();
