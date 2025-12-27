const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function exportSchema() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos...');

    // Query para obtener el esquema completo
    const schemaQuery = `
      SELECT
        table_name,
        column_name,
        data_type,
        column_default,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const viewsQuery = `
      SELECT table_name, view_definition
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const functionsQuery = `
      SELECT
        n.nspname as schema,
        p.proname as name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      ORDER BY p.proname;
    `;

    const constraintsQuery = `
      SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    console.log('Exportando tablas...');
    const tables = await client.query(tablesQuery);

    console.log('Exportando columnas...');
    const columns = await client.query(schemaQuery);

    console.log('Exportando vistas...');
    const views = await client.query(viewsQuery);

    console.log('Exportando funciones...');
    const functions = await client.query(functionsQuery);

    console.log('Exportando constraints...');
    const constraints = await client.query(constraintsQuery);

    // Crear archivo SQL
    let sqlContent = `-- Esquema completo de la base de datos
-- Exportado: ${new Date().toISOString()}
-- Base de datos: postgres
-- Proyecto: ezchqajzxaeepwqqzmyr

`;

    // Agrupar columnas por tabla
    const tableColumns = {};
    columns.rows.forEach(col => {
      if (!tableColumns[col.table_name]) {
        tableColumns[col.table_name] = [];
      }
      tableColumns[col.table_name].push(col);
    });

    // Generar CREATE TABLE statements
    sqlContent += '\n-- =============================================\n';
    sqlContent += '-- TABLAS\n';
    sqlContent += '-- =============================================\n\n';

    tables.rows.forEach(table => {
      const tableName = table.table_name;
      const cols = tableColumns[tableName] || [];

      sqlContent += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

      cols.forEach((col, index) => {
        let colDef = `  ${col.column_name} ${col.data_type}`;

        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        }

        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }

        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }

        if (index < cols.length - 1) {
          colDef += ',';
        }

        sqlContent += colDef + '\n';
      });

      sqlContent += ');\n\n';
    });

    // Constraints
    sqlContent += '\n-- =============================================\n';
    sqlContent += '-- CONSTRAINTS\n';
    sqlContent += '-- =============================================\n\n';

    const constraintsByTable = {};
    constraints.rows.forEach(con => {
      if (!constraintsByTable[con.table_name]) {
        constraintsByTable[con.table_name] = [];
      }
      constraintsByTable[con.table_name].push(con);
    });

    Object.keys(constraintsByTable).forEach(tableName => {
      const cons = constraintsByTable[tableName];
      cons.forEach(con => {
        if (con.constraint_type === 'PRIMARY KEY') {
          sqlContent += `ALTER TABLE public.${tableName} ADD CONSTRAINT ${con.constraint_name} PRIMARY KEY (${con.column_name});\n`;
        } else if (con.constraint_type === 'FOREIGN KEY' && con.foreign_table_name) {
          sqlContent += `ALTER TABLE public.${tableName} ADD CONSTRAINT ${con.constraint_name} FOREIGN KEY (${con.column_name}) REFERENCES public.${con.foreign_table_name}(${con.foreign_column_name});\n`;
        } else if (con.constraint_type === 'UNIQUE') {
          sqlContent += `ALTER TABLE public.${tableName} ADD CONSTRAINT ${con.constraint_name} UNIQUE (${con.column_name});\n`;
        }
      });
    });

    // Views
    if (views.rows.length > 0) {
      sqlContent += '\n-- =============================================\n';
      sqlContent += '-- VISTAS\n';
      sqlContent += '-- =============================================\n\n';

      views.rows.forEach(view => {
        sqlContent += `CREATE OR REPLACE VIEW public.${view.table_name} AS\n${view.view_definition}\n\n`;
      });
    }

    // Functions
    if (functions.rows.length > 0) {
      sqlContent += '\n-- =============================================\n';
      sqlContent += '-- FUNCIONES\n';
      sqlContent += '-- =============================================\n\n';

      functions.rows.forEach(func => {
        sqlContent += `${func.definition};\n\n`;
      });
    }

    // Guardar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = path.join('supabase', `schema_completo_${timestamp}.sql`);

    fs.writeFileSync(filename, sqlContent);
    console.log(`\n✅ Esquema exportado exitosamente a: ${filename}`);
    console.log(`📊 Estadísticas:`);
    console.log(`   - Tablas: ${tables.rows.length}`);
    console.log(`   - Vistas: ${views.rows.length}`);
    console.log(`   - Funciones: ${functions.rows.length}`);
    console.log(`   - Constraints: ${constraints.rows.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportSchema();
