// === Usage ===
// Simply run the following command in the root folder
// ts-node tools/dynamodb-exp/speed-read-test.ts

// To run this script with prepended time info use the command below
// ts-node tools/dynamodb-exp/speed-read-test.ts | yarn gnomon

import {
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { accessKeyId, secretAccessKey, region } from "../../.secrets/aws.json";
import assert from "assert";

process.env.AWS_ACCESS_KEY_ID = accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;

const TOKEN_SYMBOL_TO_GET = "TEST-SYMBOL-1",
      READ_OPERATIONS_COUNT_PER_ITERATION = 1000,
      NUMBER_OF_WORKERS = 1,
      DEFAULT_SOURCE = "coingecko",
      READ_INTERVAL = 1000; // ms


let globalReadOperationsState = {
  sent: 0,
  error: 0,
  gotResponse: 0,
};
  
main();
  
async function main(): Promise<void> {
  for (let workerId = 0; workerId < NUMBER_OF_WORKERS; workerId++) {
    console.log(`Running read worker with id: ${workerId}`);
    runReadWorker(workerId);
  }
}

function runReadWorker(workerId: number): void {
  const workerLog = (msg: string) =>
    console.log(`[Worker ${workerId}]: ${msg}`);

  workerLog("Connecting to DynamoDb");
  const client = new DynamoDBClient({ region });
  workerLog("Connected to DynamoDB");

  let counter = 0;
  setInterval(async () => {
    counter++;
    const reads = READ_OPERATIONS_COUNT_PER_ITERATION;
    workerLog(`Running ${reads} read operations. Iteration: ${counter}`);
    await runReadOperations(reads, client, workerLog);
  }, READ_INTERVAL);
}

async function runReadOperations(
  numberOfOperations: number,
  client: DynamoDBClient,
  workerLog: any
): Promise<void> {
  printGlobalReadOperationsState();

  const promises = [];
  for (let counter = 0; counter < numberOfOperations; counter++) {
    promises.push(printLatestPriceForToken(
      TOKEN_SYMBOL_TO_GET,
      client,
      workerLog));
  }
  await Promise.all(promises);
}

async function printLatestPriceForToken(
  token: string,
  client: DynamoDBClient,
  workerLog: any
): Promise<void> {
  try {
    // workerLog(`Fetching latest price for ${token}`);
    // printGlobalReadOperationsState();
    const price = await getLatestPriceForToken(token, client);
    // workerLog(`Fetched price for ${token}: ${price}`);
  } catch (e) {
    globalReadOperationsState.error++;
    console.error("Error occured while proce fetching", e);
  }
}

async function getLatestPriceForToken(
  token: string,
  client: DynamoDBClient
): Promise<number> {
  
  const command = new QueryCommand({
    "TableName": "prices",
    "KeyConditionExpression": `#T = :token and begins_with(TimeSource, :source)`,
    "ScanIndexForward": false, // <- This parameter enables descending sort order
    "ExpressionAttributeNames": {
      "#T": "Token"
    },
    "ExpressionAttributeValues": {
      ":token": {
        "S": token,
      },
      ":source": {
        "S": DEFAULT_SOURCE,
      },
    },
    "Limit": 1,
  });

  globalReadOperationsState.sent++;
  const response = await client.send(command);

  assert(response.Items && response.Items.length == 1,
    `Query should return exactly one item. Query response: ${JSON.stringify(response)}`);
  
  globalReadOperationsState.gotResponse++;    

  return Number(response.Items[0].Price["N"]);
}

function printGlobalReadOperationsState() {
  console.log(
    "Read operation state: " + JSON.stringify(globalReadOperationsState));
}
