import express from 'express';
import cors from 'cors';
import { DynamoDB } from 'aws-sdk';

const app = express();
const port = process.env.PORT || 3000;

// Initialize DynamoDB
const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Products';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/products', async (req: express.Request, res: express.Response) => {
  try {
    const params = {
      TableName: TABLE_NAME
    };
    const result = await dynamoDB.scan(params).promise();
    res.json(result.Items);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/products', async (req: express.Request, res: express.Response) => {
  try {
    const { name, price, description } = req.body;
    const product = {
      id: Date.now().toString(),
      name,
      price,
      description: description || ''
    };

    const params = {
      TableName: TABLE_NAME,
      Item: product
    };

    await dynamoDB.put(params).promise();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Product API server running on port ${port}`);
}); 