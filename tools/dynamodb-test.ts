import {
  DynamoDBClient,
  // ListTablesCommand,
  PutItemCommand,
  BatchWriteItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { symbolName } from "typescript";
import uuid from "uuid-random";
import { accessKeyId, secretAccessKey, region } from "../.secrets/aws.json";

process.env.AWS_ACCESS_KEY_ID = accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;

const client = new DynamoDBClient({ region });

main();

interface PriceData {
  price: number,
  symbol: string,
  date: string,
};

async function main(): Promise<void> { 
  try {
    // batchAdd1000Prices();
    // await addSingleElement();
    await getPriceByTokenSymbol("TEST2");
  } catch (err) {
    console.error(err);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO update type
async function getPriceByTokenSymbol(symbol: string): Promise<void> {
  const command = new ScanCommand({
    "TableName": "prices",
    // "Limit": 1,
    "ExpressionAttributeValues": {
      ":a": {
        S: symbol,
      },
    },
    "FilterExpression": "Symbol = :a",
  });
  const response = await client.send(command);
  // const priceObj = response.LastEvaluatedKey;
  console.log(response);
}

async function batchAdd1000Prices(): Promise<void> {
  // TODO implement splitting
  const pricesData = await generatePricesData();
  for (let i = 0; i < 40; i++) {
    // await sleep(1000);
    await batchAdd25Prices(pricesData);
  }
}

// Batch writing is limited to 25 items in a single batch
// https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
async function batchAdd25Prices(pricesData: PriceData[]) {
  const pricesCommands = [];

  for (const price of pricesData) {
    pricesCommands.push({
      PutRequest: {
        Item: {
          FeedId: { "S": uuid() },
          Price: { "N": String(price.price) },
          Symbol: { "S": price.symbol },
          Date: { "S": String(price.date) },
        },
      },
    });
  }

  const command = new BatchWriteItemCommand({
    RequestItems: { prices: pricesCommands },
    // RequestItems: { prices: [{
    //   PutRequest: {
    //     Item: {
    //       FeedId: {"S": uuid()},
    //       price: {"S": "123"},
    //     },
    //   },
    // }]},
  });

  const data = await client.send(command);

  console.log(data);
}

async function generatePricesData(): Promise<PriceData[]> {
  let prices = [];
  for (let counter = 0; counter < 25; counter++) {
    prices.push({
      price: (Math.random() * 100).toFixed(2),
      symbol: "TEST" + counter,
      date: Date.now(),
    });
  }
  return prices;
}

async function addSingleElement(): Promise<void> {
  const command = new PutItemCommand({
    TableName: "prices",
    Item: {
      FeedId: { "S": uuid() },
      Price: { "N": "12313.12" },
      Symbol: { "S": "TESTX2" },
      Date: { "S": String(Date.now()) },
    },
  });
  const data = await client.send(command);
  console.log(data);
}

// TODO implement elements fetching
// async function listElements() {
//   const command = new 
// }
