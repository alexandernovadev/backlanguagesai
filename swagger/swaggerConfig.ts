import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

import {
  fixesSwagger,
  statisticsSwagger,
  wordsSwagger,
  lectureswagger,
  generateaiswagger,
  authswagger,
  logsswagger
} from "./routes";

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
      }
    ],
    paths: {
      ...fixesSwagger["paths"],
      ...statisticsSwagger["paths"],
      ...wordsSwagger["paths"],
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
