const { Client } = require('pg');

// BD Original
const originalDB = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.ezchqajzxaeepwqqzmyr',
  password: 'Factoria314775!',
  ssl: { rejectUnauthorized: false }
});

// BD Nueva
const newDB = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dkwsuwpydwoopfuceqaf',
  password: 'avfc0vKkIV72g7RN',
  ssl: { rejectUnauthorized: false }
});

async function compareSchemas() {
  try {
    await originalDB.connect();
    await newDB.connect();
    console.log('✅ Conectado a ambas bases de datos\n');

    const schemas = ['com', 'emp', 'equ', 'mov', 'rrhh', 'seg'];

    const tablesQuery = `
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema = ANY($1)
      AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name;
    `;

    console.log('📊 Comparando esquemas...\n');

    const originalTables = await originalDB.query(tablesQuery, [schemas]);
    const newTables = await newDB.query(tablesQuery, [schemas]);

    const originalSet = new Set(
      originalTables.rows.map(t => `${t.table_schema}.${t.table_name}`)
    );
    const newSet = new Set(
      newTables.rows.map(t => `${t.table_schema}.${t.table_name}`)
    );

    // Tablas faltantes
    const missing = [...originalSet].filter(t => !newSet.has(t));

    if (missing.length > 0) {
      console.log('⚠️  TABLAS FALTANTES EN LA NUEVA BD:');
      missing.forEach(t => console.log(`   ❌ ${t}`));
      console.log('');
    } else {
      console.log('✅ Todas las tablas fueron creadas!\n');
    }

    // Tablas extra (no deberían existir)
    const extra = [...newSet].filter(t => !originalSet.has(t));
    if (extra.length > 0) {
      console.log('ℹ️  Tablas extras en la nueva BD:');
      extra.forEach(t => console.log(`   • ${t}`));
      console.log('');
    }

    // Resumen por esquema
    console.log('📋 RESUMEN POR ESQUEMA:\n');
    for (const schema of schemas) {
      const origCount = originalTables.rows.filter(t => t.table_schema === schema).length;
      const newCount = newTables.rows.filter(t => t.table_schema === schema).length;

      const status = origCount === newCount ? '✅' : '⚠️';
      console.log(`   ${status} ${schema.toUpperCase().padEnd(6)}: ${newCount}/${origCount} tablas`);
    }

    console.log(`\n   TOTAL: ${newTables.rows.length}/${originalTables.rows.length} tablas\n`);

    // Verificar tipos ENUM faltantes
    console.log('🔍 Verificando tipos ENUM...\n');

    const enumQuery = `
      SELECT n.nspname as schema, t.typname as name
      FROM pg_type t
      LEFT JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = ANY($1)
      AND t.typtype = 'e'
      ORDER BY n.nspname, t.typname;
    `;

    const originalEnums = await originalDB.query(enumQuery, [schemas]);
    const newEnums = await newDB.query(enumQuery, [schemas]);

    const originalEnumSet = new Set(
      originalEnums.rows.map(e => `${e.schema}.${e.name}`)
    );
    const newEnumSet = new Set(
      newEnums.rows.map(e => `${e.schema}.${e.name}`)
    );

    const missingEnums = [...originalEnumSet].filter(e => !newEnumSet.has(e));

    if (missingEnums.length > 0) {
      console.log('⚠️  TIPOS ENUM FALTANTES:');
      missingEnums.forEach(e => console.log(`   ❌ ${e}`));
    } else {
      console.log('✅ Todos los tipos ENUM fueron creados!');
    }

    console.log(`\n   Total ENUMs: ${newEnums.rows.length}/${originalEnums.rows.length}\n`);

    // Si hay tablas faltantes, obtener su DDL
    if (missing.length > 0) {
      console.log('📝 Obteniendo DDL de tablas faltantes...\n');

      for (const fullTableName of missing) {
        const [schema, tableName] = fullTableName.split('.');

        console.log(`\n-- Tabla: ${fullTableName}`);

        const columnsQuery = `
          SELECT
            column_name,
            data_type,
            column_default,
            is_nullable,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            udt_name
          FROM information_schema.columns
          WHERE table_schema = $1
          AND table_name = $2
          ORDER BY ordinal_position;
        `;

        const columns = await originalDB.query(columnsQuery, [schema, tableName]);

        console.log(`CREATE TABLE IF NOT EXISTS ${schema}.${tableName} (`);

        const columnDefs = columns.rows.map((col, index) => {
          let colDef = `  ${col.column_name} `;

          if (col.data_type === 'ARRAY') {
            colDef += col.udt_name.replace('_', '') + '[]';
          } else if (col.data_type === 'USER-DEFINED') {
            colDef += schema + '.' + col.udt_name;
          } else if (col.data_type === 'character varying' && col.character_maximum_length) {
            colDef += `varchar(${col.character_maximum_length})`;
          } else if (col.data_type === 'numeric' && col.numeric_precision) {
            colDef += `numeric(${col.numeric_precision},${col.numeric_scale || 0})`;
          } else {
            colDef += col.data_type;
          }

          if (col.column_default) {
            colDef += ` DEFAULT ${col.column_default}`;
          }

          if (col.is_nullable === 'NO') {
            colDef += ' NOT NULL';
          }

          return colDef;
        });

        console.log(columnDefs.join(',\n'));
        console.log(');\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await originalDB.end();
    await newDB.end();
  }
}

compareSchemas();
