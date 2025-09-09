const fs = require('fs');
const path = require('path');

// Función para leer un archivo JSON
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Función para resolver referencias $ref
function resolveRefs(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item));
  }
  
  if (obj && typeof obj === 'object') {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        // Resolver referencias relativas a schemas locales
        if (value.includes('../schemas/common.json#/components/schemas/')) {
          const schemaName = value.split('/').pop();
          resolved[key] = `#/components/schemas/${schemaName}`;
        } else {
          resolved[key] = value;
        }
      } else {
        resolved[key] = resolveRefs(value);
      }
    }
    return resolved;
  }
  
  return obj;
}

// Función para combinar archivos de paths
function combinePaths() {
  const pathsDir = path.join(__dirname, '..', 'docs', 'api', 'paths');
  const combinedPaths = {};
  
  // Orden específico de archivos según el orden de rutas
  const orderedFiles = [
    'words.json',
    'expressions.json', 
    'lectures.json',
    'users.json',
    'auth.json',
    'labs.json',
    'upload.json'
  ];
  
  // Leer archivos en el orden específico
  orderedFiles.forEach(file => {
    const filePath = path.join(pathsDir, file);
    
    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
      const data = readJsonFile(filePath);
      
      if (data && data.paths) {
        // Resolver referencias en los paths
        const resolvedPaths = resolveRefs(data.paths);
        Object.assign(combinedPaths, resolvedPaths);
        console.log(`✅ Combined paths from ${file}`);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  });
  
  return combinedPaths;
}

// Función para combinar schemas
function combineSchemas() {
  const schemasFile = path.join(__dirname, '..', 'docs', 'api', 'schemas', 'common.json');
  const schemasData = readJsonFile(schemasFile);
  
  if (schemasData && schemasData.components && schemasData.components.schemas) {
    console.log(`✅ Combined schemas from common.json`);
    return schemasData.components.schemas;
  }
  
  return {};
}

// Función para configurar autenticación
function setupAuthentication(mainSpec) {
  const jwt = require('jsonwebtoken');
  require('dotenv').config();
  
  const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
  
  // Usuario real basado en las credenciales de entorno
  const realUser = {
    _id: "real-user-id",
    username: "novask88",
    email: "nova@example.com", 
    role: "admin",
    firstName: "Nova",
    lastName: "User",
    isActive: true,
    language: "en"
  };
  
  // Generar token
  const token = jwt.sign({ user: realUser }, JWT_SECRET, { expiresIn: "7d" });
  
  // Agregar configuración de seguridad
  mainSpec.components = {
    ...mainSpec.components,
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from /api/auth/login endpoint"
      }
    }
  };
  
  // Configurar seguridad global
  mainSpec.security = [
    {
      bearerAuth: []
    }
  ];
  
  // Agregar información de autenticación en la descripción
  mainSpec.info.description = `A powerful AI-driven backend API for language learning applications

🔑 **AUTHENTICATION REQUIRED**
Most endpoints require authentication. Use the token below:

**Token:** \`${token}\`

**How to use:**
1. Click the "Authorize" button (🔒) in Scalar
2. Select "Bearer Token"
3. Paste the token above
4. Click "Authorize"

**Alternative:** Use the login endpoint:
POST /api/auth/login
Body: {"username": "novask88", "password": "sashateamomucho"}`;
  
  return token;
}

// Función principal
function buildApiDocs() {
  console.log('🚀 Building API documentation...');
  
  // Leer el archivo principal
  const mainFile = path.join(__dirname, '..', 'openapi.json');
  const mainSpec = readJsonFile(mainFile);
  
  if (!mainSpec) {
    console.error('❌ Could not read main OpenAPI spec');
    return;
  }
  
  // Combinar paths de todos los archivos
  const combinedPaths = combinePaths();
  
  // Combinar schemas
  const combinedSchemas = combineSchemas();
  
  // Reemplazar completamente los paths con el orden correcto
  mainSpec.paths = combinedPaths;
  
  // Actualizar schemas
  if (mainSpec.components) {
    mainSpec.components.schemas = {
      ...mainSpec.components.schemas,
      ...combinedSchemas
    };
  } else {
    mainSpec.components = {
      schemas: combinedSchemas
    };
  }
  
  // Configurar autenticación automáticamente
  const token = setupAuthentication(mainSpec);
  
  // Escribir el archivo final
  const outputFile = path.join(__dirname, '..', 'openapi.json');
  fs.writeFileSync(outputFile, JSON.stringify(mainSpec, null, 2));
  
  console.log(`✅ API documentation built successfully: ${outputFile}`);
  console.log(`📊 Total paths: ${Object.keys(mainSpec.paths).length}`);
  console.log(`📊 Total schemas: ${Object.keys(mainSpec.components.schemas).length}`);
  console.log(`🔑 Authentication configured with token`);
  console.log(`🚀 Ready to use in Scalar!`);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  buildApiDocs();
}

module.exports = { buildApiDocs };
