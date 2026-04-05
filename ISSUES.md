# Backend — Pending Issues

Issues found during security/quality audit. Ordered by priority.

---

## 🔵 Low

### 13. No DTOs — raw DB models returned from API
**Why:** If a model gains a sensitive field in the future, it will be exposed automatically in API responses. The API shape is also tightly coupled to the DB schema.
**What to do:** Define explicit response types and map DB documents to them before sending — similar to what `authController.ts` already does manually for the user login response.

---

## ✅ Done

- **#15** — Replaced all `console.*` with `logger` across 9 files.
- **#2** — Enforced `errorResponse()` / `successResponse()` everywhere; removed all direct `res.json()` calls from controllers.
- **#4** — Added `zod` validation on all create/update endpoints (Word, Lecture, Expression, Exam). Unknown fields are stripped before reaching the DB.
