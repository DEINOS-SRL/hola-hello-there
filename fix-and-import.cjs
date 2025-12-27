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

async function fixAndImport() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos de producción...\n');

    // Paso 1: Crear esquemas
    console.log('📋 Paso 1: Creando esquemas...');
    const schemas = ['com', 'emp', 'equ', 'mov', 'rrhh', 'seg'];

    for (const schema of schemas) {
      try {
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);
        console.log(`   ✓ ${schema}`);
      } catch (err) {
        console.log(`   ✗ ${schema}: ${err.message}`);
      }
    }

    // Paso 2: Crear tipos ENUM
    console.log('\n📋 Paso 2: Creando tipos ENUM...');

    const enumTypes = [
      "CREATE TYPE com.estado_certificacion AS ENUM ('pendiente', 'aprobada', 'rechazada', 'pagada');",
      "CREATE TYPE com.estado_presupuesto AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido');",
      "CREATE TYPE com.estado_seguimiento AS ENUM ('pendiente', 'en_proceso', 'completado', 'cancelado');",
      "CREATE TYPE com.prioridad_seguimiento AS ENUM ('baja', 'media', 'alta', 'urgente');",
      "CREATE TYPE mov.estado_movimiento AS ENUM ('borrador', 'planificado', 'en_progreso', 'completado', 'cancelado');",
      "CREATE TYPE mov.calificacion AS ENUM ('1', '2', '3', '4', '5');",
      "CREATE TYPE rrhh.estado_asistencia AS ENUM ('presente', 'ausente', 'tarde', 'licencia', 'feriado', 'vacaciones');",
      "CREATE TYPE rrhh.estado_parte AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado');",
      "CREATE TYPE rrhh.tipo_novedad AS ENUM ('accidente', 'incidente', 'observacion', 'otro');",
      "CREATE TYPE rrhh.estado_permiso AS ENUM ('pendiente', 'aprobado', 'rechazado');",
      "CREATE TYPE rrhh.tipo_permiso AS ENUM ('personal', 'medico', 'estudio', 'otro');",
      "CREATE TYPE seg.estado_feedback AS ENUM ('nuevo', 'en_revision', 'en_desarrollo', 'completado', 'rechazado', 'cancelado');",
      "CREATE TYPE seg.tipo_feedback AS ENUM ('error', 'mejora', 'funcionalidad', 'otro');",
      "CREATE TYPE seg.prioridad_feedback AS ENUM ('baja', 'media', 'alta', 'critica');",
      "CREATE TYPE seg.tipo_notificacion AS ENUM ('info', 'warning', 'error', 'success');"
    ];

    for (const enumSQL of enumTypes) {
      try {
        await client.query(enumSQL);
        const typeName = enumSQL.match(/CREATE TYPE (\S+)/)[1];
        console.log(`   ✓ ${typeName}`);
      } catch (err) {
        if (err.code === '42710') {
          const typeName = enumSQL.match(/CREATE TYPE (\S+)/)[1];
          console.log(`   • ${typeName} (ya existe)`);
        }
      }
    }

    // Paso 3: Leer y arreglar el SQL
    console.log('\n📋 Paso 3: Leyendo y corrigiendo SQL...');
    const sqlFile = path.join('supabase', 'schema_completo_2025-12-26T23-15-26.sql');
    let sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Mapeo de tipos ENUM con sus esquemas
    const typeReplacements = [
      { from: / estado_certificacion /, to: ' com.estado_certificacion ' },
      { from: / estado_presupuesto /, to: ' com.estado_presupuesto ' },
      { from: / estado_seguimiento /, to: ' com.estado_seguimiento ' },
      { from: / prioridad_seguimiento /, to: ' com.prioridad_seguimiento ' },
      { from: / estado_movimiento /, to: ' mov.estado_movimiento ' },
      { from: / calificacion /, to: ' mov.calificacion ' },
      { from: / estado_asistencia /, to: ' rrhh.estado_asistencia ' },
      { from: / estado_parte /, to: ' rrhh.estado_parte ' },
      { from: / tipo_novedad /, to: ' rrhh.tipo_novedad ' },
      { from: / estado_permiso /, to: ' rrhh.estado_permiso ' },
      { from: / tipo_permiso /, to: ' rrhh.tipo_permiso ' },
      { from: / estado_feedback /, to: ' seg.estado_feedback ' },
      { from: / tipo_feedback /, to: ' seg.tipo_feedback ' },
      { from: / prioridad_feedback /, to: ' seg.prioridad_feedback ' },
      { from: / tipo_notificacion /, to: ' seg.tipo_notificacion ' }
    ];

    let replacements = 0;
    typeReplacements.forEach(({ from, to }) => {
      const before = sqlContent.length;
      sqlContent = sqlContent.replace(new RegExp(from.source, 'g'), to);
      const after = sqlContent.length;
      if (before !== after) replacements++;
    });

    console.log(`   ✓ ${replacements} tipos corregidos`);

    // Paso 4: Ejecutar SQL corregido
    console.log('\n📋 Paso 4: Ejecutando SQL corregido...');
    console.log('   (Esto puede tomar varios minutos...)\n');

    try {
      await client.query(sqlContent);
      console.log('   ✅ SQL ejecutado correctamente!');
    } catch (err) {
      // Intentar ejecutar statement por statement si falla
      console.log('   ⚠️  Error al ejecutar todo junto, intentando por partes...\n');

      const lines = sqlContent.split('\n');
      let currentStatement = '';
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Saltar comentarios vacíos
        if (!line || line.startsWith('--')) continue;

        currentStatement += line + '\n';

        // Si termina con punto y coma, ejecutar
        if (line.endsWith(';')) {
          try {
            await client.query(currentStatement);
            successCount++;

            if (successCount % 20 === 0) {
              process.stdout.write(`   Procesadas ${successCount} statements...\r`);
            }
          } catch (stmtErr) {
            if (!stmtErr.message.includes('already exists')) {
              errorCount++;
              if (errorCount < 10) { // Solo mostrar primeros 10 errores
                console.log(`\n   ⚠️  Línea ${i + 1}: ${stmtErr.message.substring(0, 80)}`);
              }
            }
          }
          currentStatement = '';
        }
      }

      console.log(`\n   ✓ Statements ejecutados: ${successCount}`);
      console.log(`   ✗ Errores: ${errorCount}`);
    }

    // Paso 5: Verificar resultados
    console.log('\n📊 Verificando esquema creado...\n');

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
      console.log('✅ ESQUEMA CREADO EXITOSAMENTE!\n');
      console.log('Tablas por esquema:');
      let totalTables = 0;
      result.rows.forEach(row => {
        console.log(`   • ${row.table_schema.toUpperCase().padEnd(6)} : ${row.table_count} tablas`);
        totalTables += parseInt(row.table_count);
      });
      console.log(`\n   TOTAL: ${totalTables} tablas\n`);

      // Verificar funciones
      const functionsQuery = `
        SELECT n.nspname as schema, COUNT(*) as func_count
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname IN ('com', 'seg')
        GROUP BY n.nspname
        ORDER BY n.nspname;
      `;

      const funcs = await client.query(functionsQuery);
      if (funcs.rows.length > 0) {
        console.log('✅ Funciones creadas:');
        funcs.rows.forEach(f => {
          console.log(`   • ${f.schema}: ${f.func_count} funciones`);
        });
      }

      console.log('\n🎉 ¡Base de datos lista para usar!');

    } else {
      console.log('⚠️  No se encontraron tablas. Revisa los errores arriba.');
    }

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

fixAndImport();
