#!/usr/bin/env node
/**
 * Script para ejecutar migraciones de base de datos
 * Uso: node scripts/run-migrations.cjs [--dry-run]
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración de la base de datos desde variables de entorno o valores por defecto
const config = {
  host: process.env.DB_HOST || 'aws-1-us-east-2.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres.dkwsuwpydwoopfuceqaf',
  password: process.env.DB_PASSWORD || 'avfc0vKkIV72g7RN',
  ssl: {
    rejectUnauthorized: false
  }
};

const isDryRun = process.argv.includes('--dry-run');

async function runMigrations() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Crear schema y tabla de control de migraciones
    console.log('📋 Inicializando sistema de migraciones...');
    await client.query('CREATE SCHEMA IF NOT EXISTS migrations;');
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations.applied_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW(),
        checksum VARCHAR(64),
        execution_time_ms INTEGER
      );
    `);
    console.log('✅ Sistema de migraciones listo\n');

    // Leer todos los archivos de migración
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No se encontró el directorio de migraciones');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ordenar alfabéticamente (las migraciones suelen tener timestamp al inicio)

    if (files.length === 0) {
      console.log('ℹ️  No hay archivos de migración');
      return;
    }

    console.log(`📂 Encontrados ${files.length} archivos de migración\n`);

    let appliedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const filename of files) {
      const filepath = path.join(migrationsDir, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      const checksum = crypto.createHash('md5').update(content).digest('hex');

      // Verificar si ya fue aplicada
      const result = await client.query(
        'SELECT checksum FROM migrations.applied_migrations WHERE filename = $1',
        [filename]
      );

      if (result.rows.length > 0) {
        const existingChecksum = result.rows[0].checksum;

        if (existingChecksum !== checksum) {
          console.log(`⚠️  ${filename}`);
          console.log(`   La migración fue modificada después de ser aplicada`);
          console.log(`   Checksum original: ${existingChecksum}`);
          console.log(`   Checksum actual:   ${checksum}`);
        } else {
          console.log(`⏭️  ${filename} (ya aplicada)`);
        }
        skippedCount++;
        continue;
      }

      // Aplicar migración
      console.log(`▶️  ${filename}`);

      if (isDryRun) {
        console.log('   [DRY RUN] No se ejecutará (modo prueba)');
        continue;
      }

      const startTime = Date.now();

      try {
        await client.query('BEGIN');
        await client.query(content);

        // Registrar migración aplicada
        const executionTime = Date.now() - startTime;
        await client.query(
          'INSERT INTO migrations.applied_migrations (filename, checksum, execution_time_ms) VALUES ($1, $2, $3)',
          [filename, checksum, executionTime]
        );

        await client.query('COMMIT');

        console.log(`✅ ${filename} (${executionTime}ms)`);
        appliedCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error en ${filename}:`);
        console.error(`   ${error.message}`);
        errorCount++;

        // Detener en el primer error
        throw error;
      }
    }

    console.log('\n' + '='.repeat(50));

    if (isDryRun) {
      console.log('🔍 DRY RUN - No se aplicaron cambios');
    } else {
      console.log('📊 Resumen:');
      console.log(`   ✅ Aplicadas: ${appliedCount}`);
      console.log(`   ⏭️  Omitidas:  ${skippedCount}`);
      console.log(`   ❌ Errores:   ${errorCount}`);

      if (errorCount === 0) {
        console.log('\n🎉 ¡Todas las migraciones se aplicaron exitosamente!');
      } else {
        console.log('\n⚠️  Algunas migraciones fallaron');
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar
console.log('🗄️  Script de Migraciones de Base de Datos');
console.log('==========================================\n');

if (isDryRun) {
  console.log('⚠️  Modo DRY RUN activado - No se aplicarán cambios\n');
}

runMigrations();
