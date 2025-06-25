import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

import {
  fixesSwagger,
  statisticsSwagger,
  wordsSwagger,
  questionsSwagger,
  examsSwagger,
  lectureswagger,
  generateaiswagger,
  authswagger,
  logsswagger,
} from "./routes/index";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Languages API ",
      version: "2.12.0",
      description: "Documentation Languages API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        TokenQuery: {
          type: "apiKey",
          in: "query",
          name: "tokenAPI",
        },
      },
    },
    security: [{ BearerAuth: [] }, { TokenQuery: [] }],
    paths: {
      ...fixesSwagger["paths"],
      ...statisticsSwagger["paths"],
      ...wordsSwagger["paths"],
      ...questionsSwagger["paths"],
      ...examsSwagger["paths"],
      ...lectureswagger["paths"],
      ...generateaiswagger["paths"],
      ...authswagger["paths"],
      ...logsswagger["paths"],
    },
  },
  apis: ["./src/app/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  if (process.env.NODE_ENV === "development") {
    console.info("Swagger enabled in development mode");
    // @ts-ignore
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  } else {
    console.info("Swagger disabled in production mode");
  }
}
