import { performance } from "perf_hooks";
import axios from "axios";
import { Consola } from "consola";

const logger = require("./logger")("utils/performance-tracker") as Consola;
const URL = "https://api.limestone.finance/metrics";
const tasks: { [label: string]: number } = {};

export function trackStart(label: string): void {
  if (label === "") {
    throw new Error("Label cannot be empty");
  }

  if (tasks[label] !== undefined) {
    logger.warn(`Label "${label} is already being tracked"`);
    return;
  }

  tasks[label] = performance.now();
}

export function trackEnd(label: string): void {
  if (label === "") {
    throw new Error("Label cannot be empty");
  }

  if (tasks[label] === undefined) {
    throw new Error(
      "Cannot execute trackEnd without trackStart calling");
  }

  // Calculating time elapsed from the task trackStart
  // execution for the same label
  const value = performance.now() - tasks[label];

  // Clear the start value
  delete tasks[label];

  // Saving metric using Limestone HTTP endpoint
  saveMetric(label, value);
}

async function saveMetric(label: string, value: number): Promise<void> {
  await axios.post(URL, {
    label,
    value,
  });
}
