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

async function exportFullSchema() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos...\n');

    // Esquemas personalizados a exportar
    const customSchemas = ['com', 'emp', 'equ', 'mov', 'rrhh', 'seg'];

    let sqlContent = `-- =============================================
-- ESQUEMA COMPLETO DE LA BASE DE DATOS
-- Exportado: ${new Date().toISOString()}
-- Proyecto: ezchqajzxaeepwqqzmyr
-- =============================================

`;

    for (const schema of customSchemas) {
      console.log(`\n📁 Exportando esquema: ${schema}`);

      sqlContent += `\n-- =============================================\n`;
      sqlContent += `-- ESQUEMA: ${schema.toUpperCase()}\n`;
      sqlContent += `-- =============================================\n\n`;

      sqlContent += `CREATE SCHEMA IF NOT EXISTS ${schema};\n\n`;

      // Obtener tablas del esquema
      const tablesQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = '${schema}'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;

      const tables = await client.query(tablesQuery);
      console.log(`   Tablas encontradas: ${tables.rows.length}`);

      for (const table of tables.rows) {
        const tableName = table.table_name;
        console.log(`   - Exportando tabla: ${tableName}`);

        // Obtener columnas
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
          WHERE table_schema = '${schema}'
          AND table_name = '${tableName}'
          ORDER BY ordinal_position;
        `;

        const columns = await client.query(columnsQuery);

        sqlContent += `-- Tabla: ${schema}.${tableName}\n`;
        sqlContent += `CREATE TABLE IF NOT EXISTS ${schema}.${tableName} (\n`;

        const columnDefs = columns.rows.map((col, index) => {
          let colDef = `  ${col.column_name} `;

          // Tipo de dato
          if (col.data_type === 'ARRAY') {
            colDef += col.udt_name.replace('_', '') + '[]';
          } else if (col.data_type === 'USER-DEFINED') {
            colDef += col.udt_name;
          } else if (col.data_type === 'character varying' && col.character_maximum_length) {
            colDef += `varchar(${col.character_maximum_length})`;
          } else if (col.data_type === 'numeric' && col.numeric_precision) {
            colDef += `numeric(${col.numeric_precision},${col.numeric_scale || 0})`;
          } else {
            colDef += col.data_type;
          }

          // Default
          if (col.column_default) {
            colDef += ` DEFAULT ${col.column_default}`;
          }

          // NOT NULL
          if (col.is_nullable === 'NO') {
            colDef += ' NOT NULL';
          }

          return colDef;
        });

        sqlContent += columnDefs.join(',\n');
        sqlContent += '\n);\n\n';

        // Obtener constraints (PKs, FKs, Unique, Check)
        const constraintsQuery = `
          SELECT
            conname AS constraint_name,
            contype AS constraint_type,
            pg_get_constraintdef(oid) AS definition
          FROM pg_constraint
          WHERE connamespace = '${schema}'::regnamespace
          AND conrelid = '${schema}.${tableName}'::regclass
          ORDER BY contype DESC;
        `;

        const constraints = await client.query(constraintsQuery);

        if (constraints.rows.length > 0) {
          constraints.rows.forEach(con => {
            let conType = '';
            switch (con.constraint_type) {
              case 'p': conType = 'PRIMARY KEY'; break;
              case 'f': conType = 'FOREIGN KEY'; break;
              case 'u': conType = 'UNIQUE'; break;
              case 'c': conType = 'CHECK'; break;
            }
            sqlContent += `ALTER TABLE ${schema}.${tableName} ADD CONSTRAINT ${con.constraint_name} ${con.definition};\n`;
          });
          sqlContent += '\n';
        }

        // Obtener índices
        const indexesQuery = `
          SELECT
            indexname,
            indexdef
          FROM pg_indexes
          WHERE schemaname = '${schema}'
          AND tablename = '${tableName}'
          AND indexname NOT LIKE '%_pkey';
        `;

        const indexes = await client.query(indexesQuery);

        if (indexes.rows.length > 0) {
          indexes.rows.forEach(idx => {
            sqlContent += `${idx.indexdef};\n`;
          });
          sqlContent += '\n';
        }
      }

      // Obtener vistas del esquema
      const viewsQuery = `
        SELECT table_name, view_definition
        FROM information_schema.views
        WHERE table_schema = '${schema}'
        ORDER BY table_name;
      `;

      const views = await client.query(viewsQuery);

      if (views.rows.length > 0) {
        sqlContent += `-- Vistas del esquema ${schema}\n`;
        views.rows.forEach(view => {
          console.log(`   - Exportando vista: ${view.table_name}`);
          sqlContent += `CREATE OR REPLACE VIEW ${schema}.${view.table_name} AS\n${view.view_definition}\n\n`;
        });
      }

      // Obtener funciones del esquema
      const functionsQuery = `
        SELECT
          p.proname as name,
          pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = '${schema}'
        ORDER BY p.proname;
      `;

      const functions = await client.query(functionsQuery);

      if (functions.rows.length > 0) {
        sqlContent += `-- Funciones del esquema ${schema}\n`;
        functions.rows.forEach(func => {
          console.log(`   - Exportando función: ${func.name}`);
          sqlContent += `${func.definition};\n\n`;
        });
      }
    }

    // Guardar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = path.join('supabase', `schema_completo_${timestamp}.sql`);

    fs.writeFileSync(filename, sqlContent);

    console.log(`\n✅ Esquema exportado exitosamente!`);
    console.log(`📄 Archivo: ${filename}`);
    console.log(`📊 Esquemas exportados: ${customSchemas.join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

exportFullSchema();
