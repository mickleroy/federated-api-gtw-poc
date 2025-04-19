import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.CUSTOMERS_TABLE || 'Customers';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    switch (event.httpMethod) {
      case 'GET':
        return await listCustomers();
      case 'POST':
        return await createCustomer(JSON.parse(event.body || '{}'));
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

async function listCustomers() {
  const result = await dynamodb.scan({
    TableName: TABLE_NAME,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}

async function createCustomer(customer: any) {
  const item = {
    id: Date.now().toString(),
    ...customer,
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: item,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(item),
  };
} 