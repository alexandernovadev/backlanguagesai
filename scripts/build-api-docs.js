const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Función para leer un archivo JSON
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Función para obtener token real del endpoint de login
function getRealToken() {
  return new Promise((resolve) => {
    const username = process.env.USER_NOVA || "novask88";
    const password = process.env.PASSWORD_NOVA || "sashateamomucho";
    const apiUrl = process.env.API_URL || "http://localhost:3000";
    
    const postData = JSON.stringify({
      username: username,
      password: password
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const url = new URL(`${apiUrl}/api/auth/login`);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.token) {
            console.log(`🔑 Obtained real token for user: ${username}`);
            resolve(response.data.token);
          } else {
            console.error("❌ Login failed:", response.message || "Unknown error");
            resolve("gaott"); // Fallback
          }
        } catch (error) {
          console.error("❌ Error parsing login response:", error.message);
          resolve("gaott"); // Fallback
        }
      });
    });

    req.on('error', (error) => {
      console.error("❌ Error making login request:", error.message);
      resolve("gaott"); // Fallback
    });

    req.write(postData);
    req.end();
  });
}

// Función para resolver referencias $ref
function resolveRefs(obj) {
  if (typeof obj === "string") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveRefs(item));
  }

  if (obj && typeof obj === "object") {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "$ref" && typeof value === "string") {
        // Resolver referencias relativas a schemas locales
        if (value.includes("../schemas/common.json#/components/schemas/")) {
          const schemaName = value.split("/").pop();
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
  const pathsDir = path.join(__dirname, "..", "docs", "api", "paths");
  const combinedPaths = {};

  // Orden específico de archivos según el orden de rutas
  const orderedFiles = [
    "words.json",
    "expressions.json",
    "lectures.json",
    "users.json",
    "auth.json",
    "labs.json",
    "upload.json",
  ];

  // Leer archivos en el orden específico
  orderedFiles.forEach((file) => {
    const filePath = path.join(pathsDir, file);

    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
      const data = readJsonFile(filePath);

      if (data && data.paths) {
        // Resolver referencias en los paths
        const resolvedPaths = resolveRefs(data.paths);
        
        // Agregar header Miperro a todos los endpoints
        let headersAdded = 0;
        Object.keys(resolvedPaths).forEach(pathKey => {
          const path = resolvedPaths[pathKey];
          Object.keys(path).forEach(method => {
            if (path[method] && typeof path[method] === 'object') {
              if (!path[method].parameters) {
                path[method].parameters = [];
              }
              // Agregar header Authorization si no existe
              const hasAuthHeader = path[method].parameters.some(param => 
                (param.name === 'Authorization' && param.in === 'header') || 
                (param.$ref && param.$ref.includes('AuthorizationHeader'))
              );
              if (!hasAuthHeader) {
                path[method].parameters.push({
                  "$ref": "#/components/parameters/AuthorizationHeader"
                });
                headersAdded++;
              }
            }
          });
        });
        if (headersAdded > 0) {
          console.log(`🔧 Added Authorization header to ${headersAdded} endpoints`);
        }
        
        Object.assign(combinedPaths, resolvedPaths);
        console.log(`✅ Combined paths from ${file}`);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  });

  return combinedPaths;
}

// Función para combinar schemas y parámetros
async function combineSchemas() {
  const schemasFile = path.join(
    __dirname,
    "..",
    "docs",
    "api",
    "schemas",
    "common.json"
  );
  const schemasData = readJsonFile(schemasFile);

  if (schemasData && schemasData.components) {
    console.log(`✅ Combined schemas from common.json`);
    
    // Obtener token real del endpoint
    const realToken = await getRealToken();
    
    // Actualizar el parámetro Authorization con el token real
    const parameters = { ...schemasData.components.parameters };
    if (parameters.AuthorizationHeader) {
      parameters.AuthorizationHeader.schema.default = `Bearer ${realToken}`;
      // Hacer que el header esté siempre activo
      parameters.AuthorizationHeader.required = true;
      parameters.AuthorizationHeader.description = `Authorization header global - Token: ${realToken.substring(0, 20)}...`;
    }
    
    return {
      schemas: schemasData.components.schemas || {},
      parameters: parameters
    };
  }

  return { schemas: {}, parameters: {} };
}

// Función principal
async function buildApiDocs() {
  console.log("🚀 Building API documentation...");

  // Leer el archivo principal
  const mainFile = path.join(__dirname, "..", "openapi.json");
  const mainSpec = readJsonFile(mainFile);

  if (!mainSpec) {
    console.error("❌ Could not read main OpenAPI spec");
    return;
  }

  // Combinar paths de todos los archivos
  const combinedPaths = combinePaths();

  // Combinar schemas
  const combinedSchemas = await combineSchemas();

  // Reemplazar completamente los paths con el orden correcto
  mainSpec.paths = combinedPaths;

  // Actualizar schemas y parámetros
  if (mainSpec.components) {
    mainSpec.components.schemas = {
      ...mainSpec.components.schemas,
      ...combinedSchemas.schemas,
    };
    mainSpec.components.parameters = {
      ...mainSpec.components.parameters,
      ...combinedSchemas.parameters,
    };
  } else {
    mainSpec.components = {
      schemas: combinedSchemas.schemas,
      parameters: combinedSchemas.parameters,
    };
  }

  // Eliminar sección de seguridad global
  delete mainSpec.security;
  
  // Eliminar securitySchemes de autenticación
  if (mainSpec.components && mainSpec.components.securitySchemes) {
    delete mainSpec.components.securitySchemes.bearerAuth;
    // Si no quedan más securitySchemes, eliminar la sección completa
    if (Object.keys(mainSpec.components.securitySchemes).length === 0) {
      delete mainSpec.components.securitySchemes;
    }
  }

  // Escribir el archivo final
  const outputFile = path.join(__dirname, "..", "openapi.json");
  fs.writeFileSync(outputFile, JSON.stringify(mainSpec, null, 2));

  console.log(`✅ API documentation built successfully: ${outputFile}`);
  console.log(`📊 Total paths: ${Object.keys(mainSpec.paths).length}`);
  console.log(
    `📊 Total schemas: ${Object.keys(mainSpec.components.schemas).length}`
  );
  console.log(`🔓 No authentication required`);
  console.log(`🚀 Ready to use in Scalar!`);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  buildApiDocs().catch(console.error);
}

module.exports = { buildApiDocs };
