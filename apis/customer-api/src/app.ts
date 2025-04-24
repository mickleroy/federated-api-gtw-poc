import express from 'express';
import cors from 'cors';
import { DynamoDB } from 'aws-sdk';

const app = express();
const port = process.env.PORT || 3000;

// Initialize DynamoDB
const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'Customers';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/customers', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME
    };
    const result = await dynamoDB.scan(params).promise();
    res.json(result.Items);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/customers', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const customer = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email
    };

    const params = {
      TableName: TABLE_NAME,
      Item: customer
    };

    await dynamoDB.put(params).promise();
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Customer API server running on port ${port}`);
}); 