import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get Lambda ARNs from CDK context
    const productLambdaArn = this.node.tryGetContext('productLambdaArn');
    const customerLambdaArn = this.node.tryGetContext('customerLambdaArn');

    if (!productLambdaArn || !customerLambdaArn) {
      throw new Error('Lambda ARNs not provided. Please set context values for productLambdaArn and customerLambdaArn.');
    }

    // Create the API Gateway
    const api = new apigateway.SpecRestApi(this, 'ApiGateway', {
      restApiName: 'MultiApiGateway',
      apiDefinition: apigateway.ApiDefinition.fromAsset(
        path.join(__dirname, '../generated/combined.yaml')
      ),
      deployOptions: {
        stageName: 'prod',
        variables: {
          productLambdaArn,
          customerLambdaArn,
        },
      },
    });

    // Create IAM role for API Gateway
    const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    // Add Lambda invoke permissions to the role
    apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [productLambdaArn, customerLambdaArn],
      })
    );

    // Output the API Gateway URL and IDs for reference
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
} 