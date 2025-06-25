import { seedQuestionsService } from './seedQuestions';

async function resetQuestions() {
  try {
    console.log('🔄 Starting Questions Reset Process...\n');
    
    // Check current status
    console.log('📊 Checking current status...');
    const status = await seedQuestionsService.getSeedStatus();
    console.log(`   Total in seed file: ${status.totalInSeed}`);
    console.log(`   Total in database: ${status.totalInDatabase}\n`);
    
    // Confirm action
    console.log('⚠️  This will delete ALL existing questions and re-seed with fresh data!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Run the reset
    console.log('🚀 Running reset process...');
    const result = await seedQuestionsService.resetQuestions();
    
    // Display results
    console.log('\n📈 Reset Results:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Cleared: ${result.cleared}`);
    console.log(`   Created: ${result.created}`);
    console.log(`   Errors: ${result.errors.length}`);
    console.log(`   Warnings: ${result.warnings.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    if (result.success) {
      console.log('\n🎉 Questions reset completed successfully!');
    } else {
      console.log('\n💥 Questions reset completed with issues.');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the reset
resetQuestions(); 