import { getApiDocs } from './lib/swagger';
import fs from 'fs';
import path from 'path';

async function generate() {
  console.log('🔄 Generating Swagger Spec...');
  const spec = await getApiDocs();
  
  const outputPath = path.join(process.cwd(), 'public', 'swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  
  console.log('✅ Swagger JSON generated at: /public/swagger.json');
}

generate();