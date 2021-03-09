import fs from "fs";
import colors from "colors";
import yargs from "yargs";
import { JWKInterface } from "arweave/node/lib/wallet";
import { Manifest } from "./types";
import Runner from "./runner";

const { hideBin } = require("yargs/helpers");

try {
  main();
} catch (e) {
  console.error(e);
  console.log(colors.bold.bgGreen(
    "USAGE: yarn start --manifest <PATH_TO_MANIFEST_FILE_WITH_VALID_JSON> --jwk <PATH_TO_JWK>"));
};

function main(): void {
  // Reading cli arguments
  const argv = yargs(hideBin(process.argv)).argv,
        manifestFilePath = String(argv.manifest),
        jwkFilePath = String(argv.jwk);

  // Validating cli arguments
  if (manifestFilePath === undefined || manifestFilePath === "") {
    throw new Error("Path to manifest file cannot be empty");
  }
  if (jwkFilePath === undefined || jwkFilePath === "") {
    throw new Error("Path to keys file cannot be empty");
  }

  // Reading and parsing manifest file
  let manifest: Manifest,
      jwk: JWKInterface;
  const manifestFileContent: string = fs.readFileSync(manifestFilePath, "utf-8"),
        jwkFileContent: string = fs.readFileSync(jwkFilePath, "utf-8");
  try {
    manifest = JSON.parse(manifestFileContent);
    jwk = JSON.parse(jwkFileContent);
  } catch (e) {
    throw new Error("Manifest file and jwk file must be valid JSONs");
  }

  // Running limestone-node with manifest
  const runner = new Runner(manifest, jwk);
  runner.run();
}
