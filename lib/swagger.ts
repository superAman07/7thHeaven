import { createSwaggerSpec } from 'next-swagger-doc';
import path from 'path';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: path.join(process.cwd(), 'app/api'), 
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Celsius API',
        version: '1.0',
        description: `
            # 7th Heaven Mobile API
            ## 🌟 The 7th Heaven Scheme (Business Logic)
            The core of the app is the "7th Heaven" MLM structure.
            - **Goal:** Users must unlock **7 Levels** of referrals.
            - **Structure:** 5x5 Matrix (Target grows by power of 5).
            - **Active Status:** A user is ONLY 'Active' if they have purchased a **Club Essential** product (Price < Limit, default 4000).
            ### 🏆 Level Targets
            1. **Level 1:** 5 Direct Referrals
            2. **Level 2:** 25 Team Members
            3. **Level 3:** 125 Team Members
            ... and so on up to Level 7 (78,125).
            ### 🌌 Visualizing the Galaxy
            Use the \`/network/graph\` endpoint to render the tree.
            - **Nodes:** Users
            - **Links:** Referral connections
            - **Colors:** Gold (Active), Gray (Inactive)
            ## 🔐 Authentication
            All endpoints (except Login/Register) require a Bearer Token.
            
            Header: \`Authorization: Bearer <token>\`
            `,
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