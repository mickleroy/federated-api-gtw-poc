import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get Lambda function names from CDK context
    const productLambdaFunctionName = this.node.tryGetContext('productLambdaFunctionName');
    const customerLambdaFunctionName = this.node.tryGetContext('customerLambdaFunctionName');

    if (!productLambdaFunctionName || !customerLambdaFunctionName) {
      throw new Error('Lambda function names not provided. Please set context values for productLambdaFunctionName and customerLambdaFunctionName.');
    }

    // Create IAM role for API Gateway
    const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    // Add Lambda invoke permissions to the role
    apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [
          `arn:aws:lambda:${this.region}:${this.account}:function:${productLambdaFunctionName}`,
          `arn:aws:lambda:${this.region}:${this.account}:function:${customerLambdaFunctionName}`
        ],
      })
    );

    // Create the API Gateway
    const api = new apigateway.SpecRestApi(this, 'ApiGateway', {
      restApiName: 'FederatedApiGateway',
      apiDefinition: apigateway.ApiDefinition.fromAsset(
        path.join(__dirname, '../generated/combined.yaml')
      ),
      deployOptions: {
        stageName: 'prod',
        variables: {
          region: this.region,
          productLambdaFunctionName,
          customerLambdaFunctionName,
          lambdaRole: apiGatewayRole.roleArn,
          environment: 'prod'
        },
      },
    });

    // Output the API Gateway URL and IDs for reference
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
} 