// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import swagger from 'swagger-ui-express';

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
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = app => {
  app.use(
    '/api/v2/docs',
    swagger.serve,
    swagger.setup(swaggerSpec, {
      customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
      customCssUrl: CSS_URL,
    })
    // express.static(swaggerUiPath)
  );
};

export default setupSwagger;
