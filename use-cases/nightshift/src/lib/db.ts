import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;
let _schemaReady: Promise<void> | null = null;

export function usePostgres() {
  return Boolean(process.env.POSTGRES_URL);
}

function getSql() {
  if (!_sql) {
    const url = process.env.POSTGRES_URL;
    if (!url) throw new Error("POSTGRES_URL is not configured");
    _sql = neon(url);
  }
  return _sql;
}

async function ensureSchema() {
  if (!usePostgres()) return;
  if (!_schemaReady) {
    _schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS runs (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          status TEXT NOT NULL,
          is_public BOOLEAN NOT NULL DEFAULT false,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS runs_public_completed_idx
        ON runs (updated_at DESC)
        WHERE is_public = true AND status = 'completed'
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id BIGSERIAL PRIMARY KEY,
          kind TEXT NOT NULL,
          payload JSONB NOT NULL,
          at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          email TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS engine_locks (
          run_id TEXT PRIMARY KEY,
          claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS portal_profiles (
          hostname TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })();
  }
  await _schemaReady;
}

export async function withSql<T>(
  query: (sql: ReturnType<typeof neon>) => Promise<T>,
): Promise<T> {
  await ensureSchema();
  return query(getSql());
}

/** Normalize Neon query results to a row array. */
export function asRows<T extends Record<string, unknown>>(
  result: unknown,
): T[] {
  if (Array.isArray(result)) return result as T[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: T[] }).rows;
  }
  return [];
}
