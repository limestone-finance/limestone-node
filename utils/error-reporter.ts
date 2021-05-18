import axios from "axios";
import { ConsolaLogObject } from "consola";
import { v4 as uuidv4 } from 'uuid'

// We don't use logger here, because logger uses this module

//TODO: make it configurable?
//all errors from local env are currently sent to public api??
const URL = "https://api.limestone.finance/errors";

export class ConsolaErrorReporter {

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

export async function reportError(args: {
  error: string;
  errorTitle: string;
}): Promise<void> {
  const errorId = uuidv4();
  try {
    console.log(`Reporting an error ${errorId}`, args);
    await axios.post(URL, args);
    console.log(`Error reported ${errorId}`);
  } catch (e) {
    console.error(
      `Error occurred during error reporting ${errorId}`,
      e.stack);
  }
}
