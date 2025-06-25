import { seedQuestionsService } from './seedQuestions';

async function clearQuestions() {
  try {
    console.log('🗑️  Starting Questions Clear Process...\n');
    
    // Check current status
    console.log('📊 Checking current status...');
    const status = await seedQuestionsService.getSeedStatus();
    console.log(`   Total in database: ${status.totalInDatabase}\n`);
    
    if (status.totalInDatabase === 0) {
      console.log('ℹ️  No questions to clear.');
      return;
    }
    
    // Confirm action
    console.log('⚠️  This will delete ALL questions from the database!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Run the clear
    console.log('🚀 Running clear process...');
    const result = await seedQuestionsService.clearQuestions();
    
    // Display results
    console.log('\n📈 Clear Results:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Deleted: ${result.deleted}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.success) {
      console.log('\n🎉 Questions cleared successfully!');
    } else {
      console.log('\n💥 Questions clear failed.');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the clear
clearQuestions(); 