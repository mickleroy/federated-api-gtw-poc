import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create REST API from OpenAPI specification
    // FIXME: RestApi cannot route to private ALBs. Need to use public ALBs or HttpApi with VPC Link
    const api = new apigateway.SpecRestApi(this, 'FederatedApi', {
      apiDefinition: apigateway.ApiDefinition.fromAsset(path.join(__dirname, '../openapi.yaml')),
      deployOptions: {
        stageName: 'prod',
        variables: {
          productAlbDns: 'product-alb-dns',
          customerAlbDns: 'customer-alb-dns',
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