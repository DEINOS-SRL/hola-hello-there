const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Nueva base de datos de producción
const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dkwsuwpydwoopfuceqaf',
  password: 'avfc0vKkIV72g7RN',
  ssl: {
    rejectUnauthorized: false
  }
});

async function importSchema() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos de producción...\n');

    // Leer el archivo SQL
    const sqlFile = path.join('supabase', 'schema_completo_2025-12-26T23-15-26.sql');
    console.log(`📄 Leyendo archivo: ${sqlFile}`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Primero, crear los tipos ENUM que se necesitan
    console.log('\n📋 Paso 1: Creando tipos ENUM personalizados...');

    const enumTypes = [
      // Esquema com
      "CREATE TYPE com.estado_certificacion AS ENUM ('pendiente', 'aprobada', 'rechazada', 'pagada');",
      "CREATE TYPE com.estado_presupuesto AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido');",
      "CREATE TYPE com.estado_seguimiento AS ENUM ('pendiente', 'en_proceso', 'completado', 'cancelado');",
      "CREATE TYPE com.prioridad_seguimiento AS ENUM ('baja', 'media', 'alta', 'urgente');",

      // Esquema mov
      "CREATE TYPE mov.estado_movimiento AS ENUM ('borrador', 'planificado', 'en_progreso', 'completado', 'cancelado');",
      "CREATE TYPE mov.calificacion AS ENUM ('1', '2', '3', '4', '5');",

      // Esquema rrhh
      "CREATE TYPE rrhh.estado_asistencia AS ENUM ('presente', 'ausente', 'tarde', 'licencia', 'feriado', 'vacaciones');",
      "CREATE TYPE rrhh.estado_parte AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado');",
      "CREATE TYPE rrhh.tipo_novedad AS ENUM ('accidente', 'incidente', 'observacion', 'otro');",
      "CREATE TYPE rrhh.estado_permiso AS ENUM ('pendiente', 'aprobado', 'rechazado');",
      "CREATE TYPE rrhh.tipo_permiso AS ENUM ('personal', 'medico', 'estudio', 'otro');",

      // Esquema seg
      "CREATE TYPE seg.estado_feedback AS ENUM ('nuevo', 'en_revision', 'en_desarrollo', 'completado', 'rechazado', 'cancelado');",
      "CREATE TYPE seg.tipo_feedback AS ENUM ('error', 'mejora', 'funcionalidad', 'otro');",
      "CREATE TYPE seg.prioridad_feedback AS ENUM ('baja', 'media', 'alta', 'critica');",
      "CREATE TYPE seg.tipo_notificacion AS ENUM ('info', 'warning', 'error', 'success');"
    ];

    for (const enumSQL of enumTypes) {
      try {
        await client.query(enumSQL);
        console.log(`   ✓ Creado: ${enumSQL.split(' ')[2]}`);
      } catch (err) {
        if (err.code === '42710') { // Ya existe
          console.log(`   • Ya existe: ${enumSQL.split(' ')[2]}`);
        } else {
          console.log(`   ✗ Error en: ${enumSQL.split(' ')[2]} - ${err.message}`);
        }
      }
    }

    console.log('\n📋 Paso 2: Ejecutando esquema completo...');
    console.log('   (Esto puede tomar un momento...)\n');

    // Dividir el SQL en statements individuales (por punto y coma)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios
      if (statement.startsWith('--') || statement.length < 10) {
        continue;
      }

      try {
        await client.query(statement + ';');
        successCount++;

        // Mostrar progreso cada 10 statements
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`   Procesando... ${i + 1}/${statements.length}\r`);
        }
      } catch (err) {
        if (err.code === '42P07' || err.code === '42710') { // Ya existe tabla/tipo
          skipCount++;
        } else if (err.code === '42P06') { // Schema ya existe
          skipCount++;
        } else {
          errorCount++;
          // Solo mostrar errores críticos
          if (!err.message.includes('already exists') && !err.message.includes('does not exist')) {
            console.log(`\n   ⚠️  Error en statement ${i + 1}: ${err.message.substring(0, 100)}`);
          }
        }
      }
    }

    console.log(`\n\n✅ Importación completada!`);
    console.log(`\n📊 Resumen:`);
    console.log(`   • Statements ejecutados con éxito: ${successCount}`);
    console.log(`   • Elementos ya existentes (omitidos): ${skipCount}`);
    console.log(`   • Errores encontrados: ${errorCount}`);

    // Verificar que se crearon las tablas
    console.log('\n📊 Verificando tablas creadas...');
    const verifyQuery = `
      SELECT table_schema, COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema IN ('com', 'emp', 'equ', 'mov', 'rrhh', 'seg')
      AND table_type = 'BASE TABLE'
      GROUP BY table_schema
      ORDER BY table_schema;
    `;

    const result = await client.query(verifyQuery);

    if (result.rows.length > 0) {
      console.log('\n✅ Tablas creadas por esquema:');
      result.rows.forEach(row => {
        console.log(`   • ${row.table_schema}: ${row.table_count} tablas`);
      });
    } else {
      console.log('\n⚠️  No se encontraron tablas creadas. Puede haber habido errores.');
    }

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

importSchema();
