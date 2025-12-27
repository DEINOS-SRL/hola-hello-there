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
    console.log(`📄 Leyendo archivo: ${sqlFile}\n`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Paso 1: Crear esquemas
    console.log('📋 Paso 1: Creando esquemas...');
    const schemas = ['com', 'emp', 'equ', 'mov', 'rrhh', 'seg'];

    for (const schema of schemas) {
      try {
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);
        console.log(`   ✓ Esquema creado/verificado: ${schema}`);
      } catch (err) {
        console.log(`   ✗ Error creando esquema ${schema}: ${err.message}`);
      }
    }

    // Paso 2: Crear tipos ENUM
    console.log('\n📋 Paso 2: Creando tipos ENUM personalizados...');

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
        const typeName = enumSQL.match(/CREATE TYPE (\S+)/)[1];
        console.log(`   ✓ Creado: ${typeName}`);
      } catch (err) {
        if (err.code === '42710') { // Ya existe
          const typeName = enumSQL.match(/CREATE TYPE (\S+)/)[1];
          console.log(`   • Ya existe: ${typeName}`);
        } else {
          console.log(`   ✗ Error: ${err.message}`);
        }
      }
    }

    // Paso 3: Ejecutar el SQL completo
    console.log('\n📋 Paso 3: Ejecutando esquema completo...');
    console.log('   (Esto puede tomar varios minutos...)\n');

    try {
      // Ejecutar todo el SQL de una vez (PostgreSQL maneja bien los dollar-quoted strings)
      await client.query(sqlContent);
      console.log('   ✅ SQL ejecutado correctamente!\n');
    } catch (err) {
      console.log(`   ⚠️  Algunos errores ocurrieron (normal si objetos ya existen):`);
      console.log(`   ${err.message.substring(0, 200)}...\n`);
    }

    // Verificar que se crearon las tablas
    console.log('📊 Verificando esquema creado...\n');

    const schemasQuery = `
      SELECT
        table_schema,
        COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema IN ('com', 'emp', 'equ', 'mov', 'rrhh', 'seg')
      AND table_type = 'BASE TABLE'
      GROUP BY table_schema
      ORDER BY table_schema;
    `;

    const result = await client.query(schemasQuery);

    if (result.rows.length > 0) {
      console.log('✅ Tablas creadas por esquema:');
      let totalTables = 0;
      result.rows.forEach(row => {
        console.log(`   • ${row.table_schema}: ${row.table_count} tablas`);
        totalTables += parseInt(row.table_count);
      });
      console.log(`\n   Total: ${totalTables} tablas creadas`);

      // Mostrar algunas tablas de ejemplo
      console.log('\n📋 Ejemplo de tablas creadas:');
      const tablesQuery = `
        SELECT table_schema || '.' || table_name as full_name
        FROM information_schema.tables
        WHERE table_schema IN ('com', 'emp', 'equ', 'mov', 'rrhh', 'seg')
        AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name
        LIMIT 15;
      `;

      const tables = await client.query(tablesQuery);
      tables.rows.forEach(t => console.log(`   - ${t.full_name}`));

      if (totalTables > 15) {
        console.log(`   ... y ${totalTables - 15} más`);
      }

    } else {
      console.log('⚠️  No se encontraron tablas creadas.');
    }

    console.log('\n🎉 Proceso completado!');

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

importSchema();
