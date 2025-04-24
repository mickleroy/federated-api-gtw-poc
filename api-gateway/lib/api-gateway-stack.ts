import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productAlbDns = this.node.tryGetContext('productAlbDns');
    const customerAlbDns = this.node.tryGetContext('customerAlbDns');

    if (!productAlbDns || !customerAlbDns) {
      throw new Error('productAlbDns and customerAlbDns are required in context');
    }

    // Create REST API from OpenAPI specification
    const api = new apigateway.SpecRestApi(this, 'FederatedApi', {
      apiDefinition: apigateway.ApiDefinition.fromAsset(path.join(__dirname, '../generated/combined.yaml')),
      deployOptions: {
        stageName: 'prod',
        variables: {
          productAlbDns,
          customerAlbDns,
          environment: 'prod'
        }
      }
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });
  }
} 