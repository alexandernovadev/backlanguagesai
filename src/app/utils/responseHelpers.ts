import { Response } from "express";
import logger from "./logger";

export const successResponse = (
  res: Response,
  message = "Success",
  data: any,
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, data, message });
};

export const errorResponse = (
  res: Response,
  errorMessage: any,
  statusCode = 400,
  errordata?: any
) => {
  // Si errordata no es un Error, lo convertimos a uno para tener un stack
  const errorInstance =
    errordata instanceof Error
      ? errordata
      : new Error(
          errordata
            ? typeof errordata === "object"
              ? JSON.stringify(errordata)
              : String(errordata)
            : "Unknown error"
        );

  logger.error("Error Response:", {
    message: errorMessage + " - " + errordata,
    stack: errorInstance.stack || "No stack available",
  });

  return res.status(statusCode).json({ success: false, error: errorMessage });
};
