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


## 🔵 Low

### 10. Typos in identifiers
- `sinonyms` → should be `synonyms` (Word model + service)
- `bussiness` folder → should be `business` (`src/app/data/bussiness/`)
- `Lectue` → `Lecture` in `LectureController.ts:98`

**Why:** Causes confusion when searching the codebase and inconsistency in the API response shape (`sinonyms` is a public field name).

---



### 13. No DTOs — raw DB models returned from API
**Why:** If a model gains a sensitive field in the future, it will be exposed automatically in API responses. The API shape is also tightly coupled to the DB schema.
**What to do:** Define explicit response types and map DB documents to them before sending — similar to what `authController.ts` already does manually for the user login response.

---


### 15. `console.log` / `console.error` in production code
**Files:** `uploadController.ts`, `cloudinaryService.ts`
**Why:** Bypasses the Winston logger — output doesn't go to log files, has no log level, and can't be filtered or aggregated.
**What to do:** Replace all `console.*` calls with the `logger` instance.
