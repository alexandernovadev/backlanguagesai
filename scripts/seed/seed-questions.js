const { spawn } = require('child_process');
const path = require('path');

async function runSeed() {
  try {
    console.log('🌱 Starting Questions Seed Process...\n');
    
    // Run the TypeScript file directly with ts-node
    const tsNodePath = path.join(__dirname, '../node_modules/.bin/ts-node');
    const seedPath = path.join(__dirname, '../src/app/services/seed/runSeed.ts');
    
    const child = spawn(tsNodePath, [seedPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Seed process completed successfully!');
      } else {
        console.log(`\n💥 Seed process failed with code ${code}`);
      }
    });
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the seed
runSeed(); 