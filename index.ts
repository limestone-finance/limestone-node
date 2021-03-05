import fs from "fs";
import colors from "colors";
import runner from "./runner";
import { Manifest } from "./types";

try {
  main();
} catch (e) {
  console.error(e);
  console.log(colors.bold.bgGreen(
    "USAGE: yarn start <PATH_TO_manifest_FILE_WITH_VALID_JSON>"));
};

function main(): void {
  const manifestFileName: string = process.argv[2];

  // Validating manifest file argument
  if (manifestFileName === undefined || manifestFileName === "") {
    throw new Error("Path to manifest file cannot be empty");
  }

  // Reading and parsing manifest file
  let manifest: Manifest;
  const manifestFileContent: string = fs.readFileSync(manifestFileName, "utf-8");
  try {
    manifest = JSON.parse(manifestFileContent);
  } catch (e) {
    throw new Error("manifest file must be a valid JSON");
  }

  // Running limestone-node with manifest
  runner.run(manifest);
}
