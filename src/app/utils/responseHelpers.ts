import { Response } from "express";
import logger from "./logger";
import Log from "../db/models/Log";

export const successResponse = (
  res: Response,
  message = "Success",
  data?: any,
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
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

  // Guardar en la base de datos
  Log.create({
    errorMessage: typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
    statusCode,
    errorData: errordata,
    stack: errorInstance.stack || "No stack available",
  }).catch(() => {
    // Ignorar errores al guardar
  });

  return res.status(statusCode).json({ success: false, error: errorMessage });
};
