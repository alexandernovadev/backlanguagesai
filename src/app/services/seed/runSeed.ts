import { seedQuestionsService } from './seedQuestions';

async function runSeed() {
  try {
    console.log('🌱 Starting Questions Seed Process...\n');
    
    // Check current status
    console.log('📊 Checking current status...');
    const status = await seedQuestionsService.getSeedStatus();
    console.log(`   Total in seed file: ${status.totalInSeed}`);
    console.log(`   Total in database: ${status.totalInDatabase}`);
    console.log(`   Needs seeding: ${status.needsSeeding}\n`);
    
    if (!status.needsSeeding) {
      console.log('⚠️  Questions already exist in database.');
      console.log('   Use reset to clear and re-seed, or clear to remove existing questions.\n');
      return;
    }
    
    // Run the seed
    console.log('🚀 Running seed process...');
    const result = await seedQuestionsService.seedQuestions();
    
    // Display results
    console.log('\n📈 Seed Results:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Total questions: ${result.total}`);
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
      console.log('\n🎉 Questions seed completed successfully!');
    } else {
      console.log('\n💥 Questions seed completed with issues.');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the seed
runSeed(); 