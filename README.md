# Federated API Gateway POC ☁️

This project demonstrates a multi-API system using AWS API Gateway and CDK, with an API-first design approach.

## Project Structure

```
federated-api-gtw-poc/
├── api-gateway/
│   ├── bin/
│   ├── lib/
│   ├── scripts/
│   ├── openapi/
│   └── package.json
├── apis/
│   ├── product-api/
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── src/
│   │   ├── openapi.yaml
│   │   └── package.json
│   ├── customer-api/
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── src/
│   │   ├── openapi.yaml
│   │   └── package.json
└── .github/workflows/
    ├── deploy-gateway.yml
    ├── deploy-customer-api.yml
    └── deploy-product-api.yml
```

## Features

- API-first design using OpenAPI specifications
- Multiple NodeJS APIs (Product and Customer)
- AWS API Gateway configuration from OpenAPI specs
- CDK for infrastructure as code
- DynamoDB for data storage
- Lambda functions for API implementation
- Independent deployment of APIs and API Gateway
- Automated CI/CD with GitHub Actions

## Prerequisites

- Node.js (v20 or later)
- AWS CDK CLI
- AWS CLI configured with appropriate credentials
- TypeScript

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the infrastructure:
   ```bash
   # Deploy everything (APIs first, then Gateway)
   npm run deploy:all

   # Or deploy components independently
   npm run deploy:apis     # Deploy both APIs
   npm run deploy:product  # Deploy only Product API
   npm run deploy:customer # Deploy only Customer API
   npm run deploy:gateway  # Deploy only API Gateway (after APIs)
   ```

   Note: The API Gateway deployment will automatically:
   - Get the Lambda ARNs from the deployed APIs
   - Generate the combined OpenAPI spec with the correct Lambda integrations
   - Deploy the API Gateway with the proper configurations

## API Endpoints

### Product API
- GET `/product/products` - List all products
- POST `/product/products` - Create a new product

### Customer API
- GET `/customer/customers` - List all customers
- POST `/customer/customers` - Create a new customer

## Testing

Run tests for all APIs:
```bash
npm run test
```

## License

MIT 