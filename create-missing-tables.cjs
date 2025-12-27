const { Client } = require('pg');

// BD Nueva
const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dkwsuwpydwoopfuceqaf',
  password: 'avfc0vKkIV72g7RN',
  ssl: { rejectUnauthorized: false }
});

async function createMissing() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Paso 1: Crear tipos ENUM faltantes
    console.log('📋 Creando tipos ENUM faltantes...\n');

    const enumTypes = [
      "CREATE TYPE com.tipo_seguimiento AS ENUM ('llamada', 'email', 'reunion', 'visita', 'otro');",
      "CREATE TYPE equ.estado_equipo AS ENUM ('activo', 'inactivo', 'mantenimiento', 'baja');",
      "CREATE TYPE mov.tipo_movimiento AS ENUM ('servicio', 'mantenimiento', 'inspeccion', 'reparacion');",
      "CREATE TYPE rrhh.estado_novedad AS ENUM ('pendiente', 'en_revision', 'resuelta', 'rechazada');"
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
        } else {
          console.log(`   ✗ Error: ${err.message}`);
        }
      }
    }

    // Paso 2: Crear secuencias necesarias
    console.log('\n📋 Creando secuencias...\n');

    const sequences = [
      "CREATE SEQUENCE IF NOT EXISTS mov.movimientos_numero_movimiento_seq;"
    ];

    for (const seqSQL of sequences) {
      try {
        await client.query(seqSQL);
        console.log(`   ✓ Secuencia creada`);
      } catch (err) {
        console.log(`   • Secuencia ya existe`);
      }
    }

    // Paso 3: Crear tablas faltantes
    console.log('\n📋 Creando tablas faltantes...\n');

    const tables = [
      {
        name: 'com.seguimientos',
        sql: `CREATE TABLE IF NOT EXISTS com.seguimientos (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          empresa_id uuid NOT NULL,
          presupuesto_id uuid,
          tipo com.tipo_seguimiento DEFAULT 'llamada'::com.tipo_seguimiento NOT NULL,
          cliente varchar(255),
          descripcion text NOT NULL,
          fecha timestamp with time zone DEFAULT now() NOT NULL,
          responsable varchar(255),
          resultado text,
          proxima_accion text,
          fecha_proxima date,
          completado boolean DEFAULT false,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          created_by uuid
        );`
      },
      {
        name: 'equ.equipos',
        sql: `CREATE TABLE IF NOT EXISTS equ.equipos (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          empresa_id uuid NOT NULL,
          codigo varchar(50) NOT NULL,
          nombre varchar(200) NOT NULL,
          descripcion text,
          tipo_equipo_id uuid,
          marca_id uuid,
          modelo_id uuid,
          numero_serie varchar(100),
          numero_interno varchar(50),
          anio_fabricacion integer,
          fecha_adquisicion date,
          valor_adquisicion numeric(15,2),
          estado equ.estado_equipo DEFAULT 'activo'::equ.estado_equipo,
          ubicacion varchar(200),
          observaciones text,
          activo boolean DEFAULT true,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );`
      },
      {
        name: 'mov.calificaciones_operarios',
        sql: `CREATE TABLE IF NOT EXISTS mov.calificaciones_operarios (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          movimiento_id uuid NOT NULL,
          operario_id uuid NOT NULL,
          calificacion integer NOT NULL,
          comentario text,
          calificado_por uuid,
          fecha_calificacion timestamp with time zone DEFAULT now(),
          created_at timestamp with time zone DEFAULT now()
        );`
      },
      {
        name: 'mov.movimientos',
        sql: `CREATE TABLE IF NOT EXISTS mov.movimientos (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          empresa_id uuid NOT NULL,
          numero_movimiento integer DEFAULT nextval('mov.movimientos_numero_movimiento_seq'::regclass) NOT NULL,
          fecha_movimiento date DEFAULT CURRENT_DATE NOT NULL,
          cliente_id uuid,
          presupuesto_id uuid,
          asunto text NOT NULL,
          ubicacion text,
          solicitante text,
          alcance text,
          unidad_negocio_id uuid,
          tipo_movimiento_id uuid,
          subtipo_movimiento_id uuid,
          campos_dinamicos jsonb DEFAULT '{}'::jsonb,
          hora_inicio_programada time without time zone,
          hora_fin_programada time without time zone,
          supervisor_id uuid,
          remito_url text,
          observaciones_operario text,
          fecha_envio_supervisor timestamp with time zone,
          validado_por uuid,
          fecha_validacion timestamp with time zone,
          observaciones_supervisor text,
          estado text DEFAULT 'generado'::text NOT NULL,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          remitos_urls text[] DEFAULT '{}'::text[]
        );`
      },
      {
        name: 'rrhh.partes_novedades',
        sql: `CREATE TABLE IF NOT EXISTS rrhh.partes_novedades (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          parte_id uuid NOT NULL,
          tipo rrhh.tipo_novedad NOT NULL,
          descripcion text NOT NULL,
          fotos text[] DEFAULT '{}'::text[],
          estado rrhh.estado_novedad DEFAULT 'pendiente'::rrhh.estado_novedad NOT NULL,
          respuesta_supervisor text,
          created_at timestamp with time zone DEFAULT now() NOT NULL,
          updated_at timestamp with time zone DEFAULT now() NOT NULL
        );`
      }
    ];

    for (const table of tables) {
      try {
        await client.query(table.sql);
        console.log(`   ✓ ${table.name}`);
      } catch (err) {
        console.log(`   ✗ ${table.name}: ${err.message}`);
      }
    }

    // Paso 4: Agregar PKs y constraints
    console.log('\n📋 Agregando constraints...\n');

    const constraints = [
      "ALTER TABLE com.seguimientos ADD CONSTRAINT seguimientos_pkey PRIMARY KEY (id);",
      "ALTER TABLE equ.equipos ADD CONSTRAINT equipos_pkey PRIMARY KEY (id);",
      "ALTER TABLE equ.equipos ADD CONSTRAINT equipos_empresa_id_codigo_key UNIQUE (empresa_id, codigo);",
      "ALTER TABLE mov.calificaciones_operarios ADD CONSTRAINT calificaciones_operarios_pkey PRIMARY KEY (id);",
      "ALTER TABLE mov.movimientos ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id);",
      "ALTER TABLE rrhh.partes_novedades ADD CONSTRAINT partes_novedades_pkey PRIMARY KEY (id);"
    ];

    for (const constraintSQL of constraints) {
      try {
        await client.query(constraintSQL);
        console.log(`   ✓ Constraint agregado`);
      } catch (err) {
        if (err.code === '42710' || err.code === '42P07') {
          console.log(`   • Constraint ya existe`);
        } else {
          console.log(`   ⚠️  ${err.message.substring(0, 80)}`);
        }
      }
    }

    // Verificación final
    console.log('\n📊 Verificación final...\n');

    const verifyQuery = `
      SELECT table_schema, COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema IN ('com', 'emp', 'equ', 'mov', 'rrhh', 'seg')
      AND table_type = 'BASE TABLE'
      GROUP BY table_schema
      ORDER BY table_schema;
    `;

    const result = await client.query(verifyQuery);

    console.log('✅ ESQUEMA COMPLETO:\n');
    let totalTables = 0;
    result.rows.forEach(row => {
      console.log(`   • ${row.table_schema.toUpperCase().padEnd(6)}: ${row.table_count} tablas`);
      totalTables += parseInt(row.table_count);
    });
    console.log(`\n   TOTAL: ${totalTables}/40 tablas`);

    if (totalTables === 40) {
      console.log('\n🎉 ¡Todas las tablas fueron creadas exitosamente!');
    } else {
      console.log(`\n⚠️  Faltan ${40 - totalTables} tablas`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

createMissing();
