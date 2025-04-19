import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaCore from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CustomerApiStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.NodejsFunction;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const customersTable = new dynamodb.Table(this, 'CustomersTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    // Create Lambda function
    this.lambdaFunction = new lambda.NodejsFunction(this, 'CustomerLambda', {
      runtime: lambdaCore.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../src/handler.ts'),
      handler: 'handler',
      environment: {
        CUSTOMERS_TABLE: customersTable.tableName,
      },
    });

    // Grant permissions
    customersTable.grantReadWriteData(this.lambdaFunction);

    // Allow API Gateway to invoke the Lambda
    this.lambdaFunction.addPermission('ApiGatewayInvoke', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    });

    // Output the Lambda ARN for reference
    new cdk.CfnOutput(this, 'CustomerLambdaArn', {
      value: this.lambdaFunction.functionArn,
      description: 'Customer Lambda ARN',
    });
  }
} 