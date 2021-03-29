import axios from "axios";
import { ConsolaLogObject } from "consola";
import uuid from "uuid-random";

// We don't use logger here, because logger uses this module

const URL = "https://api.limestone.finance/errors";

export async function reportError(args: {
  error: string;
  errorTitle: string;
}): Promise<void> {
  // const errorId = uuid();
  // try {
  //   console.log(`Reporting an error ${errorId}`, args);
  //   await axios.post(URL, args);
  //   console.log(`Error reported ${errorId}`);
  // } catch (e) {
  //   console.error(
  //     `Error occured during error reporting ${errorId}`,
  //     e.stack);
  // }
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
