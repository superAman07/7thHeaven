import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // 👈 This scans your API folder for docs!
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Celsius API',
        version: '1.0',
        description: 'Mobile App API Documentation',
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
      security: [],
    },
  });
  return spec;
};