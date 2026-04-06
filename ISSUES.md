# Backend Issues & Technical Debt

> Análisis generado: 2026-04-06 | Versión: 6.0.1 | Estado general: **6.5/10 — No listo para producción**

---

## CRITICO — Arreglar inmediatamente

### 1. `.env` con credenciales reales en el repositorio
- **Archivo**: `/.env`
- **Problema**: Contiene API keys reales (OpenAI, DeepSeek, Cloudinary), credenciales de Gmail, y JWT secrets expuestos en Git
- **Fix**:
  ```bash
  git rm --cached .env
  echo ".env" >> .gitignore
  git commit -m "Remove .env from tracking"
  # Purgar del historial completo:
  # git filter-repo --path .env --invert-paths
  ```
- Crear `.env.example` con placeholders como referencia

### 2. JWT secrets débiles y hardcodeados
- **Archivo**: `/.env`
- **Problema**: `JWT_SECRET=secretkiarasashaymayateamomuchomucho` — no es criptográficamente seguro, fácil de bruteforcear
- **Fix**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Generar uno nuevo para `JWT_SECRET` y otro para `REFRESH_TOKEN_SECRET`, y rotarlos en producción

### 3. Credenciales de usuario seed en el repositorio
- **Archivo**: `/services/seed/user.ts`
- **Problema**: Credenciales de usuario por defecto hardcodeadas — posible backdoor en entornos de producción si el seed se ejecuta
- **Fix**: Mover a variables de entorno o eliminar antes de desplegar a prod

---

## ALTO — Resolver este mes

### 4. 74 usos de `as any` en controladores
- **Archivo principal**: `src/app/controllers/wordController.ts` (>10 instancias)
- **Problema**: Anula la seguridad de tipos de TypeScript completamente; permite datos inválidos llegar a los servicios
- **Ejemplo**:
  ```typescript
  // wordController.ts línea 73
  const newWord = await wordService.createWord(wordData as any);
  ```
- **Fix**: Usar los tipos inferidos de los schemas Zod (`z.infer<typeof Schema>`) en lugar de `as any`

### 5. Sin sanitización en queries de string — riesgo NoSQL injection
- **Archivo**: `src/app/controllers/wordController.ts` líneas 141–145
- **Problema**: `req.query.definition` y `req.query.IPA` se pasan directamente a queries de MongoDB sin escapar caracteres de regex
- **Fix**: Aplicar `escapeRegex()` (ya existe en `/utils/`) consistentemente en todos los string queries:
  ```typescript
  const definition = escapeRegex(req.query.definition as string);
  ```

### 6. Sin tests
- **Problema**: Cero cobertura de tests en un proyecto de 1 año. Sin CI/CD verification. Alto riesgo de regresiones.
- **Fix**: Agregar tests con Vitest (o Jest) priorizando:
  1. `authService.ts` — generación y verificación de tokens
  2. `wordService.ts` — lógica de filtros
  3. Middleware de autenticación
  - Meta mínima: 60% de cobertura en rutas críticas

---

## ARQUITECTURA — Resolver próximo mes

### 7. `authMiddleware` aplicado dos veces en userRoutes
- **Archivos**: `src/main.ts` línea 124 + `src/app/routes/userRoutes.ts` línea 10
- **Problema**: El middleware se aplica una vez al montar el router y otra vez dentro del router — redundante y confuso
- **Fix**: Eliminar el `router.use(authMiddleware)` dentro de `userRoutes.ts`

### 8. Arrays de chat sin límite en Word y Expression
- **Archivos**: `src/app/db/models/Word.ts`, `src/app/db/models/Expression.ts`
- **Problema**: El array `chat: ChatMessage[]` crece indefinidamente; sin TTL ni archivado — riesgo de bloat en MongoDB
- **Fix**: Agregar un índice TTL o limitar el array a los últimos N mensajes:
  ```typescript
  // Opción: limitar en el servicio al guardar
  if (doc.chat.length > 100) doc.chat = doc.chat.slice(-100);
  ```

### 9. Sin cascade delete al borrar usuarios
- **Archivos**: Modelos `Exam.ts`, `ExamAttempt.ts`
- **Problema**: Borrar un `User` deja documentos huérfanos en Exams y ExamAttempts
- **Fix**: Agregar middleware `pre('deleteOne')` en el modelo User, o implementar soft-delete con campo `deletedAt`

### 10. Coerción forzada `language: "es" → "en"` hardcodeada
- **Archivos**: `src/app/db/models/User.ts` líneas 36–52, `src/app/services/auth/authService.ts` línea 56
- **Problema**: Usuarios que quieren la interfaz en español son forzados a inglés — decisión de producto codificada como constraint técnico
- **Fix**: Eliminar la coerción o convertirla en configurable por feature flag

### 11. Sin retry logic en llamadas a APIs externas
- **Archivos**: `src/app/services/ai/*.ts`
- **Problema**: Fallo transitorio de OpenAI/DeepSeek causa error directo al usuario sin reintentos
- **Fix**: Implementar retry con exponential backoff (ej. con `p-retry`)

### 12. Manejo débil de errores en streaming
- **Archivo**: `src/app/controllers/wordController.ts` — `streamChatResponse()`
- **Problema**: `for await (const chunk of stream as any)` — el `as any` oculta errores de tipo; una respuesta de stream malformada puede crashear sin recovery
- **Fix**: Tipar correctamente el stream e implementar cierre limpio del response en el catch

---

## DEUDA TÉCNICA — Limpiar próximo trimestre

### 13. Código muerto
| Archivo | Motivo |
|---------|--------|
| `src/app/controllers/backupController.ts` (187 LOC) | No está montado en ninguna ruta |
| `src/app/data/business/{en,es,pt}/grammar.ts` | Solo re-exporta sin uso activo |
| `src/app/services/chats/` | Directorio vacío |
| Archivos JSON de seed backup | Sin referencia activa |

### 14. Dependencia sin usar
- **Archivo**: `package.json`
- **Problema**: `js-yaml` listado como dependencia pero no importado en ningún archivo
- **Fix**: `yarn remove js-yaml`

### 15. Nomenclatura inconsistente en controladores
- **Problema**: `LectureController.ts` (PascalCase) vs `wordController.ts` (camelCase) — dificulta encontrar archivos
- **Fix**: Estandarizar a camelCase (`lectureController.ts`) o PascalCase — elegir uno y aplicar en todos

### 16. Comentarios en español e inglés mezclados
- **Archivos**: `requestLogger.ts`, varios modelos
- **Problema**: Dificulta mantenimiento si el equipo crece
- **Fix**: Definir idioma oficial para comentarios de código (recomendado: inglés)

### 17. Lógica de filtros compleja en `getWords()`
- **Archivo**: `src/app/services/words/wordService.ts`
- **Problema**: 50+ parámetros posibles, difícil de testear y mantener
- **Fix**: Refactorizar en query builders composables, un filtro por función

### 18. Sin documentación de API
- **Problema**: Sin OpenAPI/Swagger — onboarding lento, integración con frontend/mobile por prueba y error
- **Fix**: Agregar `swagger-ui-express` + `zod-to-openapi` para generar docs desde los schemas Zod existentes

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

---

## Orden de prioridad recomendado

```
Semana 1:  Issues #1, #2, #3 (seguridad crítica — rotar secrets, sacar .env de Git)
Mes 1:     Issues #4, #5, #6 (tipos, injection, tests)
Mes 2:     Issues #7, #8, #9, #10, #11, #12 (arquitectura)
Q3 2026:   Issues #13–#18 (deuda técnica y documentación)
```
