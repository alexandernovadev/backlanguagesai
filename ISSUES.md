# Backend — Pending Issues

Issues found during security/quality audit. Ordered by priority.

---

## ✅ Fixed

| Issue | Fix |
|-------|-----|
| Dead plaintext credential comparison (`validateUser`) | Removed — login already used `validateUserFromDB` with bcrypt |
| NoSQL injection via unescaped `$regex` | Added `escapeRegex()` utility, applied to all 18 call sites |
| Hardcoded fallback JWT secrets (`"default_secret_key"`) | Now throws at startup if `JWT_SECRET` / `REFRESH_TOKEN_SECRET` are missing |
| `Math.random()` for IDs (not cryptographically secure) | Replaced with `crypto.randomUUID()` via `generateId()` utility (16 sites) |
| Token accepted via query param (`?tokenAPI=...`) | Removed query param fallback — `Authorization: Bearer` header only; replaced `console.*` with `logger` |
| Full error object leaked to client (`"Something went wrong: " + err`) | Global error handler now sends `"Internal server error"` to client; full error passed to `errorResponse` for server-side logging only |
| No cap on `?limit=` query parameter | Added `parseLimit()` utility (max 100, min 1); applied to all 9 sites across 4 files |
| Unbounded `find({})` on export endpoints | Replaced `.find({}).exec()` with cursor-based iteration (`for await`) on all 4 export methods — documents processed one at a time instead of buffered into memory at once |
| File upload with no content validation | Added `validateJsonBuffer()` (checks first non-whitespace char is `{` or `[`) and `MAX_IMPORT_ITEMS` cap (5,000); applied to all 4 import controllers before `JSON.parse` |
| Full request body logged (including passwords) | Added `redactBody()` in `requestLogger.ts` — replaces values of sensitive keys (`password`, `token`, `refreshToken`, etc.) with `[REDACTED]` before logging |
| No Helmet security headers | Installed `helmet@8.1.0`, added `app.use(helmet())` before all other middleware in `main.ts` |
| CORS origins hardcoded in source | Origins now read from `CORS_ORIGINS` env var (comma-separated); falls back to `localhost:5173` in dev |

---

## 🔴 Critical

### 1. `.env` committed to version control
**Why:** The `.env` file contains live credentials — OpenAI, DeepSeek, Cloudinary, Gmail, MongoDB URL with user/pass, JWT secrets, and admin credentials. Anyone with repo access has full control over every service.
**What to do:** Add `.env` to `.gitignore`, rotate ALL secrets immediately, use a secrets manager or environment injection at deploy time (Fly.io supports this natively via `fly secrets set`).

---

### 2. Token accepted via query parameter (`?tokenAPI=...`)
**File:** `src/app/middlewares/authMiddleware.ts:26`
**Why:** Tokens in URLs appear in server logs, browser history, referrer headers, and proxy logs — permanently exposing them. Also enables CSRF if cookies are involved.
**What to do:** Remove the query param fallback. Accept tokens only via the `Authorization: Bearer <token>` header.

---

### 3. Full error object leaked to client
**File:** `src/main.ts:86-88`
**Why:** `"Something went wrong: " + err` serializes the full Error object including stack trace, file paths, and internal structure — giving attackers a map of the codebase.
**What to do:** Return a generic message to the client (`"Internal server error"`), log the full error server-side only.

---

### 4. No cap on `?limit=` query parameter
**Files:** `wordController.ts:109`, `LectureController.ts:132`, `ExamController.ts:117`
**Why:** A request with `?limit=1000000` will load the entire collection into memory, crashing the server. No authentication required to trigger this.
**What to do:** Enforce a max limit (e.g. 100) server-side: `const limit = Math.min(parseInt(req.query.limit) || 10, 100)`.

---

### 5. Unbounded `find({})` queries on export endpoints
**Files:** `wordService.ts`, `LectureService.ts`, `expressionService.ts`, `userService.ts`
**Why:** Export endpoints call `Model.find({})` with no limit, returning the entire collection. On a large dataset this exhausts memory and blocks the event loop.
**What to do:** Add streaming export (cursor-based) or enforce a hard document cap on non-paginated queries.

---

### 6. File upload with no content validation
**File:** `src/app/middlewares/uploadMiddleware.ts`, `wordController.ts:409`
**Why:** Only MIME type is checked (easily spoofed). The file buffer is read entirely into memory then JSON-parsed — a crafted 10MB file can exhaust memory. No content sanitization before parsing.
**What to do:** Validate file content after reading (check JSON structure), stream large files instead of buffering, and add per-user/per-IP rate limiting on upload endpoints.

---

## 🟠 High

### 7. No rate limiting on any route
**File:** `src/main.ts` (missing middleware)
**Why:** `/api/auth/login` has no brute-force protection. AI generation endpoints (OpenAI calls) have no throttle — a single client can run up large API bills. Any endpoint is open to DoS via request flooding.
**What to do:** Add `express-rate-limit`. Strict limit on `/auth/login` (e.g. 10 req/15min per IP), moderate limit on AI endpoints (e.g. 20 req/min), general limit on all routes.

---

### 8. Full request body logged (including passwords)
**File:** `src/app/utils/requestLogger.ts:20-22`
**Why:** `req.body` is logged in full on every request. Login requests log the plaintext password. This is stored in `logs/app.log` and any log aggregator.
**What to do:** Redact sensitive fields before logging: strip `password`, `token`, `refreshToken`, and similar keys from the logged body.

---

### 9. No Helmet security headers
**File:** `src/main.ts` (missing middleware)
**Why:** Without Helmet, responses lack `X-Frame-Options` (clickjacking), `Content-Security-Policy` (XSS), `X-Content-Type-Options` (MIME sniffing), and other defensive headers.
**What to do:** `npm install helmet` and add `app.use(helmet())` before route registration.

---

### 10. CORS origins hardcoded in source
**File:** `src/main.ts:44`
**Why:** Changing allowed origins requires a code change and redeploy. In a multi-environment setup (staging, prod) this leads to either overly permissive CORS or broken deployments.
**What to do:** Read origins from an env var: `CORS_ORIGINS=https://a.com,https://b.com` and split into an array at startup.

---

### 11. No MongoDB Object ID validation on route params
**Files:** `wordController.ts`, `LectureController.ts`, `expressionController.ts`, `userController.ts` (50+ endpoints)
**Why:** Passing a non-ObjectId string (e.g. `/api/words/foo`) causes Mongoose to throw a `CastError` which is unhandled in several places and may leak internal error details.
**What to do:** Add a middleware or inline check: `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return errorResponse(res, "Invalid ID", 400)`.

---

### 12. Empty `.then(() => {})` swallowing async errors
**Files:** `wordController.ts:814`, `LectureController.ts:357`, `expressionController.ts:474`
**Why:** Cloudinary image deletion errors are silently discarded. If deletion fails, orphaned images accumulate in Cloudinary with no visibility.
**What to do:** Add `.catch((err) => logger.error("Failed to delete image", err))` to all fire-and-forget async calls.

---

### 13. Inconsistent error response format
**Files:** Several controllers mix `errorResponse()` helper with raw `res.status().json({ message: "..." })` calls.
**Why:** Clients can't rely on a consistent error shape — some errors have `{ message }`, others have the wrapper format from `responseHelpers.ts`.
**What to do:** Enforce `errorResponse()` everywhere. Remove all direct `res.json()` error calls.

---

## 🟡 Medium

### 14. No input validation framework
**Files:** All controllers — `req.body` passed directly to services/DB with no schema validation.
**Why:** Malformed or unexpected data reaches MongoDB. There's no protection against missing required fields, wrong types, or oversized strings — only what Mongoose schema validation catches at write time.
**What to do:** Add `zod` (already used in the frontend) or `express-validator`. Validate all request bodies at the controller boundary before touching the database.

---

### 15. No request timeout configured
**File:** `src/main.ts`
**Why:** A slow or stalled client connection holds a Node.js socket open indefinitely, consuming file descriptors and memory.
**What to do:** Add `server.setTimeout(30000)` after `app.listen()`, and consider `connect-timeout` middleware for per-request limits.

---

### 16. No graceful shutdown / DB connection cleanup
**File:** `src/main.ts`
**Why:** On `SIGTERM` (e.g. Fly.io rolling deploy), the process exits immediately — in-flight requests are dropped and the MongoDB connection is not cleanly closed, risking write corruption on busy instances.
**What to do:** Listen for `SIGTERM`/`SIGINT`, stop accepting new connections, wait for in-flight requests to complete, then call `disconnectDB()`.

---

### 17. No API versioning
**Files:** All route files use `/api/...` without a version prefix.
**Why:** Any breaking change to a response shape or endpoint immediately breaks all existing clients (mobile app, frontend). No way to roll out changes incrementally.
**What to do:** Prefix all routes with `/api/v1/`. Future breaking changes go under `/api/v2/`.

---

### 18. No MongoDB transactions on multi-step writes
**Files:** `wordService.ts` (import function), `expressionService.ts` (import function)
**Why:** If an import operation fails halfway through (e.g. on batch 3 of 10), the database is left in a partially updated state with no rollback.
**What to do:** Wrap multi-document import operations in a MongoDB session + transaction (`session.withTransaction(...)`).

---

### 19. Services mix too many responsibilities
**Examples:** `WordService` handles CRUD, AI orchestration, and chat history. `ExpressionService` handles CRUD, export, import, and chat.
**Why:** A bug fix in one area risks breaking another. Testing any single concern requires setting up the entire service.
**What to do:** Split into focused classes — `WordQueryService`, `WordChatService`, `WordImportService`, etc.

---

## 🔵 Low

### 20. Typos in identifiers
- `sinonyms` → should be `synonyms` (Word model + service)
- `bussiness` folder → should be `business` (`src/app/data/bussiness/`)
- `Lectue` → `Lecture` in `LectureController.ts:98`

**Why:** Causes confusion when searching the codebase and inconsistency in the API response shape (`sinonyms` is a public field name).

---

### 21. Missing compound database indexes
**Files:** `src/app/db/models/Word.ts`, `src/app/db/models/User.ts`
**Why:** The most common query pattern — filter by `language` + search by `word` — has no compound index. On large collections this becomes a full collection scan.
**What to do:** Add `{ language: 1, word: 1 }` index to `Word`, `{ email: 1 }` index to `User`.

---

### 22. Magic strings/numbers scattered throughout
**Examples:** `"hard"/"medium"/"easy"`, `"7d"/"30d"` token expiry, `5000`/`10000` timeout values, `10 * 1024 * 1024` file size.
**Why:** Changing a value (e.g. token expiry) requires hunting through the codebase. Easy to introduce inconsistencies.
**What to do:** Centralize in a `src/app/config/constants.ts` file.

---

### 23. No DTOs — raw DB models returned from API
**Why:** If a model gains a sensitive field in the future, it will be exposed automatically in API responses. The API shape is also tightly coupled to the DB schema.
**What to do:** Define explicit response types and map DB documents to them before sending — similar to what `authController.ts` already does manually for the user login response.

---

### 24. Cloudinary config fails silently
**File:** `src/app/services/cloudinary/cloudinaryService.ts:14-16`
**Why:** If `CLOUDINARY_*` env vars are missing, the service returns `null` silently. Image upload attempts later crash in unexpected ways rather than giving a clear startup error.
**What to do:** Validate Cloudinary env vars at startup alongside JWT secrets.

---

### 25. `console.log` / `console.error` in production code
**Files:** `main.ts`, `authMiddleware.ts`, `uploadController.ts`, `cloudinaryService.ts`
**Why:** Bypasses the Winston logger — output doesn't go to log files, has no log level, and can't be filtered or aggregated.
**What to do:** Replace all `console.*` calls with the `logger` instance.
