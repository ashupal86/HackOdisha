import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import type { QueryResultRow } from "pg";

// --- Types for query results ---
interface ActivityRow {
  username: string | null;
  application_name: string | null;
  client_addr: string | null;
  state: string | null;
  query_start: string | null;
  query_preview: string | null;
  state_change: string | null;
}

interface Activity {
  id: string;
  user: string;
  query: string | null;
  status: "active" | "idle" | "completed";
  time: string;
  clientAddr: string | null;
}

// --- Database connection pool ---
let pool: Pool | null = null;

function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// --- Execute database query safely ---
async function executeDbQuery<T extends QueryResultRow = Record<string, unknown>>(
  query: string,
  params: unknown[] = []
) {
  const client = await getDbPool().connect();
  try {
    const result = await client.query<T>(query, params);
    return {
      success: true as const,
      rows: result.rows,
      rowCount: result.rowCount,
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Database query failed",
    };
  } finally {
    client.release();
  }
}

// --- Metrics ---
async function getDatabaseMetrics() {
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
      executeDbQuery(connectionStatsQuery),
    ]);

    if (activeQueries.success && dbSize.success && connectionStats.success) {
      return {
        success: true,
        metrics: {
          activeQueries: String(activeQueries.rows[0]?.active_queries || 0),
          dbSize: String(dbSize.rows[0]?.db_size || "0 MB"),
          dbSizeBytes: String(dbSize.rows[0]?.db_size_bytes || 0),
          totalConnections: String(
            connectionStats.rows[0]?.total_connections || 0
          ),
          activeConnections: String(
            connectionStats.rows[0]?.active_connections || 0
          ),
          idleConnections: String(
            connectionStats.rows[0]?.idle_connections || 0
          ),
        },
      };
    }

    return { success: false, error: "Failed to fetch database metrics" };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch database metrics",
    };
  }
}

// --- Recent Activity ---
async function getRecentActivity() {
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

const result = await executeDbQuery<ActivityRow>(query);

    if (result.success) {
      const activities: Activity[] = result.rows.map((row, index) => ({
        id: `${Date.now()}-${index}`, // safer than Math.random()
        user: row.username ?? "unknown",
        query: row.query_preview,
        status:
          row.state === "active"
            ? "active"
            : row.state === "idle"
            ? "idle"
            : "completed",
        time: row.query_start
          ? new Date(row.query_start).toLocaleString()
          : "unknown",
        clientAddr: row.client_addr,
      }));

      return { success: true, activities };
    }

    return {
      success: false,
      error: result.error || "Failed to fetch recent activity",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch recent activity",
    };
  }
}

// --- Database Health ---
async function getDatabaseHealth() {
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
      executeDbQuery(upTimeQuery),
    ]);

    if (health.success && uptime.success) {
      return {
        success: true,
        health: {
          postgresVersion: health.rows[0]?.postgres_version,
          isInRecovery: health.rows[0]?.is_in_recovery,
          maxConnections: health.rows[0]?.max_connections,
          sharedBuffers: health.rows[0]?.shared_buffers,
          uptime: uptime.rows[0]?.uptime,
          startTime: uptime.rows[0]?.start_time,
        },
      };
    }

    return { success: false, error: "Failed to fetch database health" };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch database health",
    };
  }
}

// --- API Route Handler ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    switch (type) {
      case "metrics":
        return NextResponse.json(await getDatabaseMetrics());

      case "activity":
        return NextResponse.json(await getRecentActivity());

      case "health":
        return NextResponse.json(await getDatabaseHealth());

      case "all":
      default:
        const [metricsResult, activityResult, healthResult] = await Promise.all([
          getDatabaseMetrics(),
          getRecentActivity(),
          getDatabaseHealth(),
        ]);

        return NextResponse.json({
          metrics: metricsResult,
          activity: activityResult,
          health: healthResult,
        });
    }
  } catch (error) {
    console.error("Database monitoring API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch database data" },
      { status: 500 }
    );
  }
}
