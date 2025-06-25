# Upload Middlewares

Este directorio contiene middlewares centralizados para manejar diferentes tipos de subida de archivos.

## Middlewares Disponibles

### 1. JSON Upload Middleware
Para subir archivos JSON (importación de datos):

```typescript
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

// En las rutas
router.post("/import-file", ...createJsonUploadMiddleware(), importController);
```

### 2. Image Upload Middleware
Para subir imágenes:

```typescript
import { createImageUploadMiddleware } from "../middlewares/uploadMiddleware";

// En las rutas
router.post("/upload-image", ...createImageUploadMiddleware(), imageController);
```

### 3. ZIP Upload Middleware
Para subir archivos ZIP:

```typescript
import { createZipUploadMiddleware } from "../middlewares/uploadMiddleware";

// En las rutas
router.post("/upload-zip", ...createZipUploadMiddleware(), zipController);
```

## Configuración

- **Tamaño máximo**: 10MB para todos los tipos
- **Almacenamiento**: Memory storage (archivos en memoria)
- **Validación**: Por tipo MIME específico para cada formato

## Manejo de Errores

Todos los middlewares incluyen manejo automático de errores para:
- Archivos demasiado grandes
- Tipos de archivo no permitidos
- Errores de multer

## Ejemplo de Uso Completo

```typescript
// En un archivo de rutas
import { Router } from "express";
import { 
  createJsonUploadMiddleware, 
  createImageUploadMiddleware 
} from "../middlewares/uploadMiddleware";
import { importData, uploadImage } from "../controllers/myController";

const router = Router();

// Ruta para importar JSON
router.post("/import", ...createJsonUploadMiddleware(), importData);

// Ruta para subir imagen
router.post("/image", ...createImageUploadMiddleware(), uploadImage);

export default router;
``` 