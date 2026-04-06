# Backend Issues & Technical Debt

> Última actualización: 2026-04-06 | Versión: 6.0.1

---

## ALTO — Resolver este mes

### 2. 74 usos de `as any` en controladores
- **Archivo principal**: `src/app/controllers/wordController.ts` (>10 instancias)
- **Problema**: Anula la seguridad de tipos de TypeScript completamente; permite datos inválidos llegar a los servicios
- **Ejemplo**:
  ```typescript
  // wordController.ts línea 73
  const newWord = await wordService.createWord(wordData as any);
  ```
- **Fix**: Usar los tipos inferidos de los schemas Zod (`z.infer<typeof Schema>`) en lugar de `as any`

### 3. Sin sanitización en queries de string — riesgo NoSQL injection
- **Archivo**: `src/app/controllers/wordController.ts` líneas 141–145
- **Problema**: `req.query.definition` y `req.query.IPA` se pasan directamente a queries de MongoDB sin escapar caracteres de regex
- **Fix**: Aplicar `escapeRegex()` (ya existe en `/utils/`) consistentemente en todos los string queries:
  ```typescript
  const definition = escapeRegex(req.query.definition as string);
  ```

### 4. Sin tests
- **Problema**: Cero cobertura de tests en un proyecto de 1 año. Sin CI/CD verification. Alto riesgo de regresiones.
- **Fix**: Agregar tests con Vitest (o Jest) priorizando:
  1. `authService.ts` — generación y verificación de tokens
  2. `wordService.ts` — lógica de filtros
  3. Middleware de autenticación
  - Meta mínima: 60% de cobertura en rutas críticas

---

## ARQUITECTURA — Resolver próximo mes

### 5. Coerción forzada `language: "es" → "en"` hardcodeada
- **Archivos**: `src/app/db/models/User.ts` líneas 36–52, `src/app/services/auth/authService.ts` línea 56
- **Problema**: Usuarios que quieren la interfaz en español son forzados a inglés — decisión de producto codificada como constraint técnico
- **Fix**: Eliminar la coerción o convertirla en configurable por feature flag

### 6. Sin retry logic en llamadas a APIs externas
- **Archivos**: `src/app/services/ai/*.ts`
- **Problema**: Fallo transitorio de OpenAI/DeepSeek causa error directo al usuario sin reintentos
- **Fix**: Implementar retry con exponential backoff (ej. con `p-retry`)

### 7. Manejo débil de errores en streaming
- **Archivo**: `src/app/controllers/wordController.ts` — `streamChatResponse()`
- **Problema**: `for await (const chunk of stream as any)` — el `as any` oculta errores de tipo; una respuesta de stream malformada puede crashear sin recovery
- **Fix**: Tipar correctamente el stream e implementar cierre limpio del response en el catch

---

## DEUDA TÉCNICA — Limpiar próximo trimestre

### 8. Comentarios en español e inglés mezclados
- **Archivos**: `requestLogger.ts`, varios modelos
- **Problema**: Dificulta mantenimiento si el equipo crece
- **Fix**: Definir idioma oficial para comentarios de código (recomendado: inglés)

### 9. Lógica de filtros compleja en `getWords()`
- **Archivo**: `src/app/services/words/wordService.ts`
- **Problema**: 50+ parámetros posibles, difícil de testear y mantener
- **Fix**: Refactorizar en query builders composables, un filtro por función

### 10. Sin documentación de API
- **Problema**: Sin OpenAPI/Swagger — onboarding lento, integración con frontend/mobile por prueba y error
- **Fix**: Agregar `swagger-ui-express` + `zod-to-openapi` para generar docs desde los schemas Zod existentes

---

## Resueltos ✓

| # original | Issue | Fecha |
|------------|-------|-------|
| 1 | Credenciales seed hardcodeadas — movidas a `USER_NOVA` / `PASSWORD_NOVA` | 2026-04-06 |
| 7 | `authMiddleware` aplicado dos veces en `userRoutes` | 2026-04-06 |
| 8 | Arrays de chat sin límite en Word y Expression | 2026-04-06 |
| 9 | Sin cascade delete al borrar usuarios | 2026-04-06 |
| 13 | Código muerto (backupController, grammar.ts, directorios vacíos) | 2026-04-06 |
| 14 | Dependencia `js-yaml` sin usar | 2026-04-06 |
| 15 | Nomenclatura inconsistente en controladores | 2026-04-06 |

---

## Lo que está bien

- Arquitectura en capas limpia: routes → controllers → services → DB
- Zod para validación en el borde de entrada con patrón `parseBody()`
- Patrón DTO para whitelistear campos en respuestas
- Índices de MongoDB bien definidos (language + difficulty, full-text en Lecture)
- Middleware stack correcto: Helmet, rate limiting por ruta, graceful shutdown
- Separación de servicios de AI por dominio (word, lecture, exam, image)
- Redacción de secrets en request logger
- Timeout extendido (120s) para rutas de AI y uploads
- Multi-stage Dockerfile
