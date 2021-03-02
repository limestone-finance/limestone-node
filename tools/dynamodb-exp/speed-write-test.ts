// === Usage ===
// Simply run the following command in the root folder
// ts-node tools/dynamodb-exp/speed-write-test.ts

// To run this script with prepended time info use the command below
// ts-node tools/dynamodb-exp/speed-write-test.ts | yarn gnomon

import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import _ from "lodash";
import { accessKeyId, secretAccessKey, region } from "../../.secrets/aws.json";
import { PriceData } from "./types";

process.env.AWS_ACCESS_KEY_ID = accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;

let client: DynamoDBClient;
const WRITE_INTERVAL = 1000, // ms
      TOKENS_COUNT = 1000,
      MAX_BATCH_ITEMS_COUNT = 25,
      DEFAULT_SOURCE = "coingecko",
      TABLE_NAME = "prices";

main();

async function main(): Promise<void> { 
  try {
    console.log("Connecting to DynamoDb");
    client = new DynamoDBClient({ region });
    console.log("Connected to DynamoDB");

    let counter = 0;
    
    setInterval(async () => {
      counter++;
      console.log(
        `Uploading ${TOKENS_COUNT} prices. Operation nr: ${counter}`);
      await uploadTokenPricesToDB(TOKENS_COUNT);
      console.log(
        `${TOKENS_COUNT} prices uploaded. Opration nr: ${counter}`);
    }, WRITE_INTERVAL);
  } catch (err) {
    console.error(err);
  }
}

async function uploadTokenPricesToDB(pricesCount: number): Promise<void> {
  const prices = generatePricesData(pricesCount);
  const batches = _.chunk(prices, MAX_BATCH_ITEMS_COUNT);
  const promises = [];

  for (const batch of batches) {
    // TODO maybe add error handling for each write promise here
    promises.push(uploadPricesBatch(batch));
  }

  await Promise.all(promises);
}

// Batch writing is limited to 25 items in a single batch
// https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
async function uploadPricesBatch(batch: PriceData[]): Promise<void> {
  // Building batch write command
  const pricesCommands = [];
  for (const price of batch) {
    pricesCommands.push({
      PutRequest: {
        Item: {
          "Token": { "S": price.symbol },
          "TimeSource": { "S": price.source + "#" + price.time },
          "Price": { "N": String(price.price) },
          "Prices": { "S": JSON.stringify(price.prices) },
        },
      },
    });
  }
  const command = new BatchWriteItemCommand({
    RequestItems: {
      [TABLE_NAME]: pricesCommands,
    },
  });

  // Sending batch write command
  const data = await client.send(command);

  console.log("Batch uploaded");
  // console.log(data); // TODO comment
}

function generatePricesData(pricesCount: number): PriceData[] {
  let prices = [];
  for (let counter = 0; counter < pricesCount; counter++) {
    prices.push({
      symbol: `TEST-SYMBOL-${counter}`,
      time: Date.now(),
      source: DEFAULT_SOURCE,
      price: getRandomPrice(),
      prices: getRandomPricesWithSourcesObj(),
    });
  }
  return prices;
}

function getRandomPricesWithSourcesObj(): object {
  return {
    "coingecko": getRandomPrice(),
    "coinbase": getRandomPrice(),
    "european-central-bank": getRandomPrice(),
    "uniswap": getRandomPrice(),
  };
}

function getRandomPrice(): string {
  return (Math.random() * 100).toFixed(2);
}
