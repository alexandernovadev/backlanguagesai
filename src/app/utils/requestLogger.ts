import { Request, Response, NextFunction } from "express";
import logger from "./logger";

const REDACTED = "[REDACTED]";
const SENSITIVE_KEYS = new Set([
  "password",
  "passwordConfirm",
  "currentPassword",
  "newPassword",
  "token",
  "refreshToken",
  "accessToken",
  "secret",
  "apiKey",
  "authorization",
]);

function redactBody(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : value;
  }
  return result;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.originalUrl === "/favicon.ico") {
    return next();
  }

  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const responseTime = diff[0] * 1e3 + diff[1] / 1e6;

    const bodyLog = Object.keys(req.body || {}).length > 0
      ? `📝 Body: ${JSON.stringify(redactBody(req.body), null, 2)}`
      : "";

    const logMessage = `
🚀 Incoming Request:
  👉 Method: ${req.method}
  🌐 URL: ${req.originalUrl}
  💻 Client IP: ${req.ip}
  📱 User-Agent: ${req.headers["user-agent"]}
  📦 Content-Length: ${req.headers["content-length"] || 0}
  ⏳ Response Time: ${responseTime.toFixed(2)} ms
  ✅ Status: ${res.statusCode}
  ${bodyLog}
    `.trim();

    logger.info(logMessage);
  });

  next();
};
