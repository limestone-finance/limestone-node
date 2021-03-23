import axios from "axios";
import { ConsolaLogObject } from "consola";

// We don't use logger here, because logger uses this module

const URL = "https://api.limestone.finance/errors";

export async function reportError(args: {
  error: string;
  errorTitle: string;
}): Promise<void> {
  try {
    console.log(`Reporting an error`, args);
    await axios.post(URL, args);
    console.log("Error reported");
  } catch (e) {
    console.error("Error occured during error reporting", e.stack);
  }
}

export class ConsolaErrorReporter {
  constructor() {}

  log(logObj: ConsolaLogObject) {
    const levels = {
      0: "ERROR",
      1: "WARNING",
    } as any;

    const level = logObj.level as any;

    if (level <= 1) {
      reportError({
        error: JSON.stringify(logObj.args),
        errorTitle: `${levels[level]}-${logObj.tag}`,
      });
    }
  }
};
