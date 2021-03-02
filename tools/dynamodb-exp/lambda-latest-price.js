const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        // event.queryStringParameters
        switch (event.httpMethod) {
            case 'GET':
                body = await dynamo.query({
                    TableName: "prices",
                    "KeyConditionExpression": `#T = :token and begins_with(TimeSource, :source)`,
                    "ScanIndexForward": false, // <- This parameter enables descending sort order
                    "ExpressionAttributeNames": {
                        "#T": "Token",
                    },
                    "ExpressionAttributeValues": {
                        ":token": event.queryStringParameters.token,
                        ":source": "coingecko",
                    },
                    "Limit": 1,
                }).promise();
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
