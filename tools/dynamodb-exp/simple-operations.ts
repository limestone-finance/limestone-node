// === Usage ===
// Simply run the following command in the root folder
// ts-node tools/dynamodb-exp/simple-operations.ts

// To run this script with prepended time info use the command below
// ts-node tools/dynamodb-exp/simple-operations.ts | yarn gnomon

import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { accessKeyId, secretAccessKey, region } from "../../.secrets/aws.json";
import { PriceData } from "./types";

let client: DynamoDBClient;
const DEFAULT_SOURCE = "test-source",
      DEFAULT_SYMBOL = "test-token",
      DEFAULT_PRICE = 1.23,
      MOCK_PRICES = [
        { source: "source-1", price: 1.23 },
        { source: "source-2", price: 1.21 },
        { source: "source-3", price: 1.25 },
      ];

process.env.AWS_ACCESS_KEY_ID = accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;

main();

async function main(): Promise<void> { 
  try {
    console.log("Connecting to DynamoDb");
    client = new DynamoDBClient({ region });
    console.log("Connected to DynamoDB");

    console.log("Putting a new price item to dynamodb");
    await addPrice({
      price: DEFAULT_PRICE,
      symbol: DEFAULT_SYMBOL,
      time: String(Date.now()),
      source: DEFAULT_SOURCE,
      prices: MOCK_PRICES,
    });

    console.log("Getting the latest item from dynamodb");
    await getLatestPrice(DEFAULT_SYMBOL, DEFAULT_SOURCE);
  } catch (err) {
    console.error(err);
  }
}

async function addPrice(price: PriceData): Promise<void> {
  const command = new PutItemCommand({
    "TableName": "prices",
    "Item": {
      "Token": { "S": price.symbol },
      "TimeSource": { "S": price.source + "#" + price.time },
      "Price": { "N": String(price.price) },
      "Prices": { "S": JSON.stringify(price.prices) },
    }
  });

  const response = await client.send(command);

  console.log(response);
}

async function getLatestPrice(token: string, source: string): Promise<void> {
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
        "S": source,
      },
    },
    "Limit": 1,
  });

  const response = await client.send(command);

  console.log(response.Items);
}
