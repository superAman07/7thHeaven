import { createSwaggerSpec } from 'next-swagger-doc';
import fs from 'fs';
import path from 'path';

async function generate() {
  console.log('🔄 Generating Swagger Spec...');

  const rootDir = process.cwd();
  const apiPath = path.join(rootDir, 'app/api');

  console.log(`📂 Scanning API folder at: ${apiPath}`);

  // Verify folder exists
  if (!fs.existsSync(apiPath)) {
    console.error('❌ API Folder NOT found!');
    process.exit(1);
  }

  const spec = createSwaggerSpec({
    // IMPORTANT: Force the specific glob pattern to include subdirectories
    apiFolder: 'app/api',
    apis: ['./app/api/**/*.ts', './app/api/**/*.tsx'], // Explicitly tell swagger-jsdoc where to look
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Celsius API',
        version: '1.0',
        description: 'Celsius Mobile API Documentation', // Keep it simple for debug
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  // Debug: Log if paths are empty
  const pathCount = Object.keys((spec as any).paths).length;
  console.log(`📊 Found ${pathCount} paths.`);

  if (pathCount === 0) {
    console.warn('⚠️  WARNING: No paths found! Check your JSDoc comments.');
  }

  const outputPath = path.join(rootDir, 'public', 'swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

  console.log('✅ Swagger JSON generated at: /public/swagger.json');
}

generate();