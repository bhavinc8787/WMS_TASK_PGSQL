// Swagger configuration for Express

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from './index';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WMS API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Warehouse Management System',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
