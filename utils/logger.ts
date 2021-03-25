import consola from "consola";
import { ConsolaErrorReporter } from "./error-reporter";

module.exports = (moduleName: string) => {

  let mainReporter = new (consola as any).FancyReporter();

  // Currently we can set reporters using env variables
  if (process.env.ENABLE_JSON_LOGS === "true") {
    mainReporter = new (consola as any).JSONReporter();
  }

  return consola.create({
    // Here we can pass additional options for loger configuration

    // level: 4
    reporters: [
      mainReporter,
      new ConsolaErrorReporter(),
    ],
  }).withTag(moduleName);
}

