const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/languagesia');

// Importar el servicio de migración
const { MigrationService } = require('../src/app/services/migration/migrationService');

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración de palabras al sistema de repaso inteligente...');

    const migrationService = new MigrationService();
    const result = await migrationService.migrateWordsToReviewSystem();

    if (result.success) {
      console.log('\n🎉 Migración completada exitosamente!');
      console.log(`✅ Palabras migradas: ${result.migratedCount}`);
      console.log(`⏭️  Palabras saltadas: ${result.skippedCount}`);
      console.log(`📊 Total procesadas: ${result.totalProcessed}`);
    } else {
      console.error('❌ Error durante la migración:', result.error);
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar la migración
runMigration();

