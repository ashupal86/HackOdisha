import { Pool } from 'pg';

// Type definitions
interface DatabaseResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number | null;
  command: string;
  fields: unknown[];
}

interface DatabaseMetrics {
  activeQueries: string;
  dbSize: string;
  dbSizeBytes: string;
  totalConnections: string;
  activeConnections: string;
  idleConnections: string;
}

interface TableInfo {
  table_name: string;
  table_schema: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
}

interface ForeignKeyInfo {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

interface QueryPerformanceInfo {
  query: string;
  calls: number;
  total_exec_time: number;
  mean_exec_time: number;
  min_exec_time: number;
  max_exec_time: number;
  rows: number;
  hit_percent: number;
}

interface ActivityInfo {
  id: number;
  user: string;
  query: string;
  status: string;
  time: string;
  clientAddr: string | null;
}

interface HealthInfo {
  postgresVersion: string;
  isInRecovery: boolean;
  maxConnections: number;
  sharedBuffers: string;
  uptime: string;
  startTime: string;
}

// New interface for full database schema
interface DatabaseSchema {
  [tableName: string]: {
    columns: ColumnInfo[];
    tableInfo: TableInfo;
  };
}

interface FullSchemaResult {
  success: boolean;
  error?: string;
  schema?: DatabaseSchema;
  tableCount?: number;
}

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

export async function executeDbQuery(query: string, params: unknown[] = []): Promise<DatabaseResult<QueryResult>> {
  const client = await getDbPool().connect();
  try {
    const result = await client.query(query, params);
    return {
      success: true,
      data: {
        rows: result.rows,
        rowCount: result.rowCount,
        command: result.command,
        fields: result.fields
      }
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
    return result.success && result.data?.rows[0]?.exists === true;
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
export async function getAllTables(): Promise<DatabaseResult<TableInfo[]>> {
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

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.rows as TableInfo[]
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch tables'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch database schema'
    };
  }
}

export async function getTableColumns(tableName: string): Promise<DatabaseResult<ColumnInfo[]>> {
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

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.rows as ColumnInfo[]
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch table columns'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch table columns'
    };
  }
}

export async function getForeignKeys(): Promise<DatabaseResult<ForeignKeyInfo[]>> {
  try {
    const query = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name;
    `;
    
    const result = await executeDbQuery(query);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.rows as ForeignKeyInfo[]
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch foreign keys'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch foreign keys'
    };
  }
}

// Database monitoring functions
export async function getDatabaseMetrics(): Promise<DatabaseResult<DatabaseMetrics>> {
  try {
    const activeQueriesQuery = `
      SELECT count(*) as active_queries
      FROM pg_stat_activity 
      WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%';
    `;

    const dbSizeQuery = `
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size,
             pg_database_size(current_database()) as db_size_bytes;
    `;

    const connectionStatsQuery = `
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity;
    `;

    const [activeQueries, dbSize, connectionStats] = await Promise.all([
      executeDbQuery(activeQueriesQuery),
      executeDbQuery(dbSizeQuery),
      executeDbQuery(connectionStatsQuery)
    ]);

    if (activeQueries.success && dbSize.success && connectionStats.success && 
        activeQueries.data && dbSize.data && connectionStats.data) {
      return {
        success: true,
        data: {
          activeQueries: activeQueries.data.rows[0].active_queries?.toString() || '0',
          dbSize: dbSize.data.rows[0].db_size?.toString() || '0',
          dbSizeBytes: dbSize.data.rows[0].db_size_bytes?.toString() || '0',
          totalConnections: connectionStats.data.rows[0].total_connections?.toString() || '0',
          activeConnections: connectionStats.data.rows[0].active_connections?.toString() || '0',
          idleConnections: connectionStats.data.rows[0].idle_connections?.toString() || '0'
        }
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch database metrics'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch database metrics'
    };
  }
}

export async function getQueryPerformanceStats(): Promise<DatabaseResult<QueryPerformanceInfo[]>> {
  try {
    const query = `
      SELECT 
        query,
        calls,
        total_exec_time,
        mean_exec_time,
        min_exec_time,
        max_exec_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements 
      WHERE query NOT LIKE '%pg_stat_%'
      ORDER BY total_exec_time DESC 
      LIMIT 10;
    `;

    const result = await executeDbQuery(query);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.rows as QueryPerformanceInfo[]
      };
    } else {
      // Fallback if pg_stat_statements is not available
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    return {
      success: true,
      data: []
    };
  }
}

export async function getRecentActivity(): Promise<DatabaseResult<ActivityInfo[]>> {
  try {
    const query = `
      SELECT 
        usename as username,
        application_name,
        client_addr,
        state,
        query_start,
        LEFT(query, 100) as query_preview,
        state_change
      FROM pg_stat_activity 
      WHERE query IS NOT NULL 
        AND query NOT LIKE '%pg_stat_activity%'
        AND state IS NOT NULL
      ORDER BY query_start DESC 
      LIMIT 10;
    `;

    const result = await executeDbQuery(query);
    
    if (result.success && result.data) {
      const activities = result.data.rows.map((row: any) => ({
        id: Math.random(),
        user: row.username || 'unknown',
        query: row.query_preview,
        status: row.state === 'active' ? 'active' : row.state === 'idle' ? 'idle' : 'completed',
        time: row.query_start ? new Date(row.query_start).toLocaleString() : 'unknown',
        clientAddr: row.client_addr
      }));

      return {
        success: true,
        data: activities as ActivityInfo[]
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch recent activity'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent activity'
    };
  }
}

export async function getDatabaseHealth(): Promise<DatabaseResult<HealthInfo>> {
  try {
    const healthQuery = `
      SELECT 
        version() as postgres_version,
        current_setting('server_version_num')::int as version_num,
        pg_is_in_recovery() as is_in_recovery,
        current_setting('max_connections')::int as max_connections,
        current_setting('shared_buffers') as shared_buffers;
    `;

    const upTimeQuery = `
      SELECT 
        date_trunc('second', current_timestamp - pg_postmaster_start_time()) as uptime,
        pg_postmaster_start_time() as start_time;
    `;

    const [health, uptime] = await Promise.all([
      executeDbQuery(healthQuery),
      executeDbQuery(upTimeQuery)
    ]);

    if (health.success && uptime.success && health.data && uptime.data) {
      return {
        success: true,
        data: {
          postgresVersion: health.data.rows[0].postgres_version,
          isInRecovery: health.data.rows[0].is_in_recovery,
          maxConnections: health.data.rows[0].max_connections,
          sharedBuffers: health.data.rows[0].shared_buffers,
          uptime: uptime.data.rows[0].uptime,
          startTime: uptime.data.rows[0].start_time
        }
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch database health'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch database health'
    };
  }
}

export async function getFullDatabaseSchema(): Promise<FullSchemaResult> {
  try {
    console.log('Fetching complete database schema...');
    
    // First, get all tables
    const tablesResult = await getAllTables();
    
    if (!tablesResult.success || !tablesResult.data) {
      return {
        success: false,
        error: tablesResult.error || 'Failed to fetch tables'
      };
    }

    const tables = tablesResult.data;
    const schema: DatabaseSchema = {};

    // For each table, get its columns
    for (const table of tables) {
      console.log(`Fetching columns for table: ${table.table_name}`);
      
      const columnsResult = await getTableColumns(table.table_name);
      
      if (columnsResult.success && columnsResult.data) {
        schema[table.table_name] = {
          columns: columnsResult.data,
          tableInfo: table
        };
      } else {
        console.warn(`Failed to fetch columns for table ${table.table_name}: ${columnsResult.error}`);
        // Continue with other tables even if one fails
        schema[table.table_name] = {
          columns: [],
          tableInfo: table
        };
      }
    }

    console.log(`Successfully fetched schema for ${Object.keys(schema).length} tables`);

    return {
      success: true,
      schema,
      tableCount: Object.keys(schema).length
    };
  } catch (error) {
    console.error('Error fetching full database schema:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch full database schema'
    };
  }
}