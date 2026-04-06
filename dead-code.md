# Dead Code Analysis — back

> Generated: 2026-04-05. Todos los hallazgos verificados con grep.

---

## 1. Archivos a eliminar (alta confianza)

### `src/app/controllers/backupController.ts`
Controlador completo nunca importado por ningún router. Las funciones de backup que sí se usan viven en `labsController.ts` → `sendBackupByEmailHandler()`.

Funciones muertas: `sendBackupNow`, `testBackup`, `getBackupStatus`, `testEmailOnly`, `startCron`, `stopCron`, `getCronStatusController`, `testCron`, `updateCronScheduleController`.

---

## 2. Exports muertos en archivos activos

### Grammar data lists (3 idiomas)
Los tres archivos exportan dos listas que nadie consume fuera del propio barrel:

| Archivo | Export muerto |
|---------|---------------|
| `src/app/data/business/en/grammar.ts` | `grammarTopicsJson`, `grammarTopicsList` |
| `src/app/data/business/es/grammar.ts` | `grammarTopicsJson`, `grammarTopicsList` |
| `src/app/data/business/pt/grammar.ts` | `grammarTopicsJson`, `grammarTopicsList` |

Los `index.ts` de cada idioma los re-exportan, pero ningún consumidor los importa.

### `src/app/db/models/index.ts`
Barrel de conveniencia que re-exporta todos los modelos (`User`, `Word`, `Expression`, `Lecture`, `AIConfig`). Nadie lo importa — el código usa rutas directas (`db/models/Word`, etc.).

---

## 3. Dependencia npm sin usar

| Paquete | En package.json | Usado en src/ |
|---------|-----------------|----------------|
| `js-yaml` | ✓ | ✗ |

---

## 4. Archivos de datos obsoletos (seed/)

Snapshots de septiembre 2025, nunca importados por ningún archivo TypeScript:

- `src/app/data/seed/words-backup8sep2025.json` (~1 MB)
- `src/app/data/seed/expressions-backup8sep2025.json` (~48 KB)
- `src/app/data/seed/lectures-backup8sep2025.json` (~227 KB)

Si se necesitan como respaldo histórico, moverlos fuera de `src/`.

---

## 5. Directorios vacíos

- `src/app/services/chats/`
- `src/app/services/ai/prompts/wordChat/`
- `src/app/services/logs/`

---

## Resumen

| Categoría | Acción |
|-----------|--------|
| `backupController.ts` | Borrar |
| Grammar lists (6 exports × 3 archivos) | Borrar exports + re-exports de index.ts |
| `db/models/index.ts` | Borrar |
| `js-yaml` en package.json | Borrar |
| 3 JSON de seed | Borrar (o archivar fuera de src/) |
| 3 directorios vacíos | Borrar |

---

## Lo que está bien

- ✓ Sin código comentado
- ✓ Sin rutas montadas a medias
- ✓ Sin middleware huérfano
- ✓ Sin lógica duplicada
- ✓ Todos los 10 routers están montados en `main.ts`
- ✓ Todos los middlewares están aplicados
