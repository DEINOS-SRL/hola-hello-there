const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.ezchqajzxaeepwqqzmyr',
  password: 'Factoria314775!',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchemas() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos...\n');

    // Ver todos los esquemas
    const schemasQuery = `
      SELECT schema_name
      FROM information_schema.schemata
      ORDER BY schema_name;
    `;

    const schemas = await client.query(schemasQuery);
    console.log('📁 Esquemas disponibles:');
    schemas.rows.forEach(s => console.log(`   - ${s.schema_name}`));

    // Ver tablas en todos los esquemas
    const allTablesQuery = `
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `;

    console.log('\n📊 Tablas encontradas:');
    const allTables = await client.query(allTablesQuery);

    const tablesBySchema = {};
    allTables.rows.forEach(t => {
      if (!tablesBySchema[t.table_schema]) {
        tablesBySchema[t.table_schema] = [];
      }
      tablesBySchema[t.table_schema].push(t.table_name);
    });

    Object.keys(tablesBySchema).forEach(schema => {
      console.log(`\n   Esquema: ${schema} (${tablesBySchema[schema].length} tablas)`);
      tablesBySchema[schema].forEach(table => {
        console.log(`      - ${table}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchemas();
