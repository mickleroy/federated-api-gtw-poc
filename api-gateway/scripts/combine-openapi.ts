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

  const files = fs.readdirSync(apisDir);
  const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
  
  for (const file of yamlFiles) {
    const specPath = path.join(apisDir, file);
    try {
      const spec = yaml.load(fs.readFileSync(specPath, 'utf8')) as OpenAPISpec;
      
      // Skip if not a valid OpenAPI spec
      if (!spec.openapi || !spec.paths) {
        console.warn(`Skipping ${file} - not a valid OpenAPI specification`);
        continue;
      }
      
      const pathPrefix = '';
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
    } catch (error) {
      console.warn(`Error processing ${file}:`, error);
    }
  }

  return combined;
}

try {
  // Generate combined OpenAPI spec
  const apisDir = path.join(__dirname, '../apis');
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

  // Write the combined spec to a file
  const outputPath = path.join(outputDir, 'combined.yaml');
  fs.writeFileSync(outputPath, yaml.dump(combined));
  console.log(`Combined OpenAPI specification written to ${outputPath}`);
} catch (error) {
  console.error('Error generating OpenAPI spec:', error);
  process.exit(1);
} 