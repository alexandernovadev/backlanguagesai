const { spawn } = require('child_process');
const path = require('path');

async function resetQuestions() {
  try {
    console.log('🔄 Starting Questions Reset Process...\n');
    
    // Run the TypeScript file directly with ts-node
    const tsNodePath = path.join(__dirname, '../node_modules/.bin/ts-node');
    const resetPath = path.join(__dirname, '../src/app/services/seed/runReset.ts');
    
    const child = spawn(tsNodePath, [resetPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Reset process completed successfully!');
      } else {
        console.log(`\n💥 Reset process failed with code ${code}`);
      }
    });
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the reset
resetQuestions(); 