# Backend — Pending Issues

Issues found during security/quality audit. Ordered by priority.

---

## 🟠 High

### 2. Inconsistent error response format
**Files:** Several controllers mix `errorResponse()` helper with raw `res.status().json({ message: "..." })` calls.
**Why:** Clients can't rely on a consistent error shape — some errors have `{ message }`, others have the wrapper format from `responseHelpers.ts`.
**What to do:** Enforce `errorResponse()` everywhere. Remove all direct `res.json()` error calls.

---

## 🟡 Medium

### 4. No input validation framework
**Files:** All controllers — `req.body` passed directly to services/DB with no schema validation.
**Why:** Malformed or unexpected data reaches MongoDB. There's no protection against missing required fields, wrong types, or oversized strings — only what Mongoose schema validation catches at write time.
**What to do:** Add `zod` (already used in the frontend) or `express-validator`. Validate all request bodies at the controller boundary before touching the database.

---

### 5. No graceful shutdown / DB connection cleanup
**File:** `src/main.ts`
**Why:** On `SIGTERM` (e.g. Fly.io rolling deploy), the process exits immediately — in-flight requests are dropped and the MongoDB connection is not cleanly closed, risking write corruption on busy instances.
**What to do:** Listen for `SIGTERM`/`SIGINT`, stop accepting new connections, wait for in-flight requests to complete, then call `disconnectDB()`.

---

### 7. No API versioning
**Files:** All route files use `/api/...` without a version prefix.
**Why:** Any breaking change to a response shape or endpoint immediately breaks all existing clients (mobile app, frontend). No way to roll out changes incrementally.
**What to do:** Prefix all routes with `/api/v1/`. Future breaking changes go under `/api/v2/`.

---

### 8. No MongoDB transactions on multi-step writes
**Files:** `wordService.ts` (import function), `expressionService.ts` (import function)
**Why:** If an import operation fails halfway through (e.g. on batch 3 of 10), the database is left in a partially updated state with no rollback.
**What to do:** Wrap multi-document import operations in a MongoDB session + transaction (`session.withTransaction(...)`).

---

### 9. Services mix too many responsibilities
**Examples:** `WordService` handles CRUD, AI orchestration, and chat history. `ExpressionService` handles CRUD, export, import, and chat.
**Why:** A bug fix in one area risks breaking another. Testing any single concern requires setting up the entire service.
**What to do:** Split into focused classes — `WordQueryService`, `WordChatService`, `WordImportService`, etc.

---

## 🔵 Low

### 10. Typos in identifiers
- `sinonyms` → should be `synonyms` (Word model + service)
- `bussiness` folder → should be `business` (`src/app/data/bussiness/`)
- `Lectue` → `Lecture` in `LectureController.ts:98`

**Why:** Causes confusion when searching the codebase and inconsistency in the API response shape (`sinonyms` is a public field name).

---

### 11. Missing compound database indexes
**Files:** `src/app/db/models/Word.ts`, `src/app/db/models/User.ts`
**Why:** The most common query pattern — filter by `language` + search by `word` — has no compound index. On large collections this becomes a full collection scan.
**What to do:** Add `{ language: 1, word: 1 }` index to `Word`, `{ email: 1 }` index to `User`.

---

### 12. Magic strings/numbers scattered throughout
**Examples:** `"hard"/"medium"/"easy"`, `"7d"/"30d"` token expiry, `5000`/`10000` timeout values, `10 * 1024 * 1024` file size.
**Why:** Changing a value (e.g. token expiry) requires hunting through the codebase. Easy to introduce inconsistencies.
**What to do:** Centralize in a `src/app/config/constants.ts` file.

---

### 13. No DTOs — raw DB models returned from API
**Why:** If a model gains a sensitive field in the future, it will be exposed automatically in API responses. The API shape is also tightly coupled to the DB schema.
**What to do:** Define explicit response types and map DB documents to them before sending — similar to what `authController.ts` already does manually for the user login response.

---

### 14. Cloudinary config fails silently
**File:** `src/app/services/cloudinary/cloudinaryService.ts:14-16`
**Why:** If `CLOUDINARY_*` env vars are missing, the service returns `null` silently. Image upload attempts later crash in unexpected ways rather than giving a clear startup error.
**What to do:** Validate Cloudinary env vars at startup alongside JWT secrets.

---

### 15. `console.log` / `console.error` in production code
**Files:** `main.ts`, `uploadController.ts`, `cloudinaryService.ts`
**Why:** Bypasses the Winston logger — output doesn't go to log files, has no log level, and can't be filtered or aggregated.
**What to do:** Replace all `console.*` calls with the `logger` instance.
