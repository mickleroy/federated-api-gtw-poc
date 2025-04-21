#!/bin/bash

# Get Lambda ARNs from CloudFormation outputs
PRODUCT_ARN=$(aws cloudformation describe-stacks --stack-name ProductApiStack --query 'Stacks[0].Outputs[?OutputKey==`ProductLambdaArn`].OutputValue' --output text)
CUSTOMER_ARN=$(aws cloudformation describe-stacks --stack-name CustomerApiStack --query 'Stacks[0].Outputs[?OutputKey==`CustomerLambdaArn`].OutputValue' --output text)

# Extract function names from ARNs
# ARN format: arn:aws:lambda:region:account:function:functionName
PRODUCT_FUNCTION_NAME=$(echo $PRODUCT_ARN | cut -d':' -f7)
CUSTOMER_FUNCTION_NAME=$(echo $CUSTOMER_ARN | cut -d':' -f7)

# Run the OpenAPI spec generation
npm run combine-specs

# Change to api-gateway directory
cd "$(dirname "$0")/.."

# Deploy the API Gateway with function names
cdk deploy --context productLambdaFunctionName=$PRODUCT_FUNCTION_NAME --context customerLambdaFunctionName=$CUSTOMER_FUNCTION_NAME 