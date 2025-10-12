// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // ✅ should be 'url', not 'URL'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const __swaggerDistPath = path.join(
  __dirname,
  'node_modules',
  'swagger-ui-dist'
);

const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Review-Aide-API',
      version: '1.0.0',
      description:
        'API documentation for Review-Aide project',
    },
    servers: [
      {
        url: `${process.env.BASE_URL}/api/v2`,
        description: 'Server URL',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // paths to your API files
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = app => {
  app.use(
    '/api/v2/docs',
    express.static(__swaggerDistPath, { index: false }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCssUrl: CSS_URL, // ✅ properly include custom CSS
    })
  );
};

export default setupSwagger;
