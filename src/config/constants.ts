// ─── Auth ────────────────────────────────────────────────────────────────────
export const JWT_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_EXPIRES_IN = "30d";

// ─── Rate limiting ────────────────────────────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_GENERAL_MAX = 300;
export const RATE_LIMIT_AUTH_MAX = 10;
export const RATE_LIMIT_AI_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_AI_MAX = 20;

// ─── Timeouts ─────────────────────────────────────────────────────────────────
export const SERVER_TIMEOUT_MS = 30_000;     // General socket timeout
export const AI_REQUEST_TIMEOUT_MS = 120_000; // Extended timeout for AI/upload routes

// ─── File uploads ─────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMPORT_ITEMS = 5_000;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const MAX_PAGINATION_LIMIT = 100;

// ─── MongoDB connection ───────────────────────────────────────────────────────
export const MONGO_RECONNECTION_DELAY_MS = 5_000;
export const MONGO_SERVER_SELECTION_TIMEOUT_MS = 10_000;
export const MONGO_SOCKET_TIMEOUT_MS = 45_000;
export const MONGO_HEARTBEAT_FREQUENCY_MS = 10_000;
