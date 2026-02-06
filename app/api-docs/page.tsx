'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
// 1. Import the JSON directly (Go up 2 levels to root, then public)
import spec from '../../public/swagger.json'; 

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  // 2. Pass 'spec' instead of 'url'
  return <SwaggerUI spec={spec} />;
}