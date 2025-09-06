const db_url = process.env.DATABASE_URL as string;

import { Pool } from 'pg';

// Database connection pool
let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function executeDbQuery(query: string, params: any[] = []): Promise<any> {
  const client = await getDbPool().connect();
  try {
    const result = await client.query(query, params);
    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command,
      fields: result.fields
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed'
    };
  } finally {
    client.release();
  }
}

export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await executeDbQuery(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.success && result.rows[0]?.exists;
  } catch {
    return false;
  }
}

export async function createProductsTableIfNotExists(): Promise<void> {
  const exists = await checkTableExists('products');
  if (!exists) {
    await executeDbQuery(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

// New functions for dynamic schema fetching
export async function getAllTables(): Promise<any> {
  try {
    const result = await executeDbQuery(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    return {
      success: true,
      tables: result.rows
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tables'
    };
  }
}

export async function getTableColumns(tableName: string): Promise<any> {
  try {
    const result = await executeDbQuery(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return {
      success: true,
      columns: result.rows
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch table columns'
    };
  }
}

export async function getFullDatabaseSchema(): Promise<any> {
  try {
    const tablesResult = await getAllTables();
    if (!tablesResult.success) {
      return tablesResult;
    }

    const schema: any = {};
    
    for (const table of tablesResult.tables) {
      const columnsResult = await getTableColumns(table.table_name);
      if (columnsResult.success) {
        schema[table.table_name] = {
          columns: columnsResult.columns,
          schema: table.table_schema
        };
      }
    }

    return {
      success: true,
      schema,
      tableCount: tablesResult.tables.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch database schema'
    };
  }
}

export async function getForeignKeys(): Promise<any> {
  try {
    const result = await executeDbQuery(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    return {
      success: true,
      foreignKeys: result.rows
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch foreign keys'
    };
  }
}