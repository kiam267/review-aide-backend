import 'dotenv';
import swagger from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Swagger configuration
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
        url: 'http://localhost:8080/api/v2',
        description: 'Local server',
      },
    ],
  },
  // Path to the API docs (your route files)
  apis: ['./routes/*.js', './controllers/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);

// Function to setup Swagger in your app
const setupSwagger = app => {
  app.use(
    '/api/v2/docs',
    swagger.serve,
    swagger.setup(swaggerSpec)
  );
};

export default setupSwagger;
