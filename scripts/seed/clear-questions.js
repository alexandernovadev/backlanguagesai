const { spawn } = require('child_process');
const path = require('path');

async function clearQuestions() {
  try {
    console.log('🗑️  Starting Questions Clear Process...\n');
    
    // Run the TypeScript file directly with ts-node
    const tsNodePath = path.join(__dirname, '../node_modules/.bin/ts-node');
    const clearPath = path.join(__dirname, '../src/app/services/seed/runClear.ts');
    
    const child = spawn(tsNodePath, [clearPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Clear process completed successfully!');
      } else {
        console.log(`\n💥 Clear process failed with code ${code}`);
      }
    });
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the clear
clearQuestions(); 