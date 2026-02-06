'use client'; 

import React from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically load Swagger component to avoid SSR issues
const SwaggerUI = dynamic<{ url: string }>(
    // @ts-ignore
    () => import('swagger-ui-react'), 
    { ssr: false }
);

export default function ApiDocPage() {
  return (
    <div className="bg-white min-h-screen">
       <SwaggerUI url="/api/v1/doc" />
    </div>
  );
}