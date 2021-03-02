import fs from "fs";
import colors from "colors";
import runner from "./runner";

try {
  main();
} catch (e) {
  console.error(e);
  console.log(colors.bold.bgGreen(
    "USAGE: yarn start <PATH_TO_CONFIG_FILE_WITH_VALID_JSON>"));
};

function main(): void {
  const configFileName: string = process.argv[2];

  // Validating config file argument
  if (configFileName === undefined || configFileName === "") {
    throw new Error("Path to config file cannot be empty");
  }

  // Reading and parsing config file
  let config: object;
  const configFileContent: string = fs.readFileSync(configFileName, "utf-8");
  try {
    config = JSON.parse(configFileContent);
  } catch (e) {
    throw new Error("Config file must be a valid JSON");
  }

  // Running limestone-node with config
  runner.run(config);
}
