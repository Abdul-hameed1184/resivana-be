import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Resivana API",
      version: "1.0.0",
      description: "Resivana Backend API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/api/v1/routes/*.ts", "./dist/api/v1/routes/*.js"], // where your API comments live
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
