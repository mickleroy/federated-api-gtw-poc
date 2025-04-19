import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface OpenAPISpec {
  openapi: string;
  info: any;
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
    [key: string]: any;
  };
}

function combineOpenAPISpecs(apisDir: string): OpenAPISpec {
  const combined: OpenAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'Combined API Gateway',
      version: '1.0.0',
      description: 'Combined API specifications for all microservices'
    },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {}
    }
  };

  const apis = fs.readdirSync(apisDir);
  
  for (const api of apis) {
    const specPath = path.join(apisDir, api, 'openapi.yaml');
    if (fs.existsSync(specPath)) {
      const spec = yaml.load(fs.readFileSync(specPath, 'utf8')) as OpenAPISpec;
      
      const pathPrefix = `/${api.replace('-api', '')}`;
      const prefixedPaths = Object.entries(spec.paths).reduce((acc, [path, methods]) => {
        acc[`${pathPrefix}${path}`] = methods;
        return acc;
      }, {} as Record<string, any>);
      
      combined.paths = { ...combined.paths, ...prefixedPaths };
      
      if (spec.components) {
        if (spec.components.schemas) {
          combined.components!.schemas = {
            ...combined.components!.schemas,
            ...spec.components.schemas
          };
        }
        if (spec.components.securitySchemes) {
          combined.components!.securitySchemes = {
            ...combined.components!.securitySchemes,
            ...spec.components.securitySchemes
          };
        }
      }
    }
  }

  return combined;
}

try {
  // Generate combined OpenAPI spec
  const apisDir = path.join(__dirname, '../../apis');
  if (!fs.existsSync(apisDir)) {
    throw new Error(`APIs directory not found at ${apisDir}`);
  }

  const combined = combineOpenAPISpecs(apisDir);

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../generated');
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get Lambda ARNs from environment variables
  const productLambdaArn = process.env.PRODUCT_LAMBDA_ARN;
  const customerLambdaArn = process.env.CUSTOMER_LAMBDA_ARN;

  if (!productLambdaArn || !customerLambdaArn) {
    throw new Error('Lambda ARNs not provided. Please set PRODUCT_LAMBDA_ARN and CUSTOMER_LAMBDA_ARN environment variables.');
  }

  // Add AWS API Gateway extensions with actual Lambda ARNs
  const awsExtendedSpec = {
    ...combined,
    paths: Object.entries(combined.paths).reduce((acc, [path, methods]) => {
      const service = path.split('/')[1];
      const lambdaArn = service === 'product' ? productLambdaArn : customerLambdaArn;
      
      acc[path] = Object.entries(methods as Record<string, any>).reduce((methodAcc, [method, config]) => {
        methodAcc[method] = {
          ...config,
          'x-amazon-apigateway-integration': {
            uri: `arn:aws:apigateway:${process.env.AWS_REGION || 'ap-southeast-2'}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
            passthroughBehavior: 'when_no_match',
            httpMethod: 'POST',
            type: 'aws_proxy'
          }
        };
        return methodAcc;
      }, {} as Record<string, any>);
      return acc;
    }, {} as Record<string, any>)
  };

  // Write the combined spec to a file
  const outputPath = path.join(outputDir, 'combined.yaml');
  fs.writeFileSync(outputPath, yaml.dump(awsExtendedSpec));
  console.log(`Combined OpenAPI specification written to ${outputPath}`);
} catch (error) {
  console.error('Error generating OpenAPI spec:', error);
  process.exit(1);
} 