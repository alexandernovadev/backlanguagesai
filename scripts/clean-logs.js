#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to logs directory
const logsDir = path.join(__dirname, '../logs');

// List of log files to clean
const logFiles = ['app.log', 'errors.log', 'exceptions.log', 'rejections.log'];

console.log('🧹 Limpiando archivos de logs...\n');

let cleanedCount = 0;
let errorCount = 0;

logFiles.forEach((file) => {
  const filePath = path.join(logsDir, file);
  
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Get file size before cleaning
      const stats = fs.statSync(filePath);
      const sizeBefore = (stats.size / 1024 / 1024).toFixed(2); // Size in MB
      
      // Truncate file (empty it but keep the file)
      fs.writeFileSync(filePath, '');
      
      cleanedCount++;
      console.log(`✅ ${file} limpiado (${sizeBefore} MB liberados)`);
    } else {
      console.log(`⚠️  ${file} no existe, se omitió`);
    }
  } catch (error) {
    errorCount++;
    console.error(`❌ Error al limpiar ${file}:`, error.message);
  }
});

console.log(`\n✨ Limpieza completada: ${cleanedCount} archivo(s) limpiado(s)`);
if (errorCount > 0) {
  console.log(`⚠️  ${errorCount} error(es) encontrado(s)`);
  process.exit(1);
}
