#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate build date
const buildDate = new Date().toISOString();

// Path to main.ts
const mainTsPath = path.join(__dirname, '../src/main.ts');

// Read the current main.ts file
let mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

// Replace the date line with the build date
const dateRegex = /date:\s*new Date\(\)\.toISOString\(\)/;
const replacement = `date: "${buildDate}"`;

if (dateRegex.test(mainTsContent)) {
  mainTsContent = mainTsContent.replace(dateRegex, replacement);
  
  // Write back to the file
  fs.writeFileSync(mainTsPath, mainTsContent);
  
  console.log(`✅ Build date updated: ${buildDate}`);
} else {
  console.log('⚠️  Could not find date line to replace in main.ts');
  process.exit(1);
} 