const jwt = require("jsonwebtoken");
require("dotenv").config();

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

function generateToken() {
  const token = jwt.sign({ user: realUser }, JWT_SECRET, { expiresIn: "7d" });
  
  console.log("🔑 TOKEN GENERADO:");
  console.log("=" .repeat(80));
  console.log(token);
  console.log("=" .repeat(80));
  console.log("\n📋 CREDENCIALES:");
  console.log(`Username: ${realUser.username}`);
  console.log(`Password: sashateamomucho`);
  console.log(`Role: ${realUser.role}`);
  console.log("\n🚀 COMO USAR EN SCALAR:");
  console.log("1. Haz clic en el botón 'Authorize' (🔒)");
  console.log("2. Selecciona 'Bearer Token'");
  console.log("3. Pega el token de arriba");
  console.log("4. Haz clic en 'Authorize'");
  console.log("\n⏰ Token válido por 7 días");
  console.log("\n💡 También puedes usar el endpoint de login:");
  console.log("POST /api/auth/login");
  console.log(`Body: {"username": "novask88", "password": "sashateamomucho"}`);
  
  return token;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateToken();
}

module.exports = { generateToken };
