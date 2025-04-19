#!/bin/bash

# Get Lambda ARNs from CloudFormation outputs
PRODUCT_ARN=$(aws cloudformation describe-stacks --stack-name ProductApiStack --query 'Stacks[0].Outputs[?OutputKey==`ProductLambdaArn`].OutputValue' --output text)
CUSTOMER_ARN=$(aws cloudformation describe-stacks --stack-name CustomerApiStack --query 'Stacks[0].Outputs[?OutputKey==`CustomerLambdaArn`].OutputValue' --output text)

export PRODUCT_LAMBDA_ARN=$PRODUCT_ARN
export CUSTOMER_LAMBDA_ARN=$CUSTOMER_ARN

# Run the OpenAPI spec generation
npm run combine-specs

# Change to api-gateway directory
cd "$(dirname "$0")/.."

# Deploy the API Gateway with context values
cdk deploy --context productLambdaArn=$PRODUCT_ARN --context customerLambdaArn=$CUSTOMER_ARN 