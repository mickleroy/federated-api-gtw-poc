import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.PRODUCTS_TABLE || 'Products';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    switch (event.httpMethod) {
      case 'GET':
        return await listProducts();
      case 'POST':
        return await createProduct(JSON.parse(event.body || '{}'));
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

async function listProducts() {
  const result = await dynamodb.scan({
    TableName: TABLE_NAME,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}

async function createProduct(product: any) {
  const item = {
    id: Date.now().toString(),
    ...product,
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