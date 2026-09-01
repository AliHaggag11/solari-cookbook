import { promises as fs } from "fs";
import path from "path";
import { asRows, usePostgres, withSql } from "./db";
import type {
  AnalyticsEvent,
  NightshiftRun,
  WaitlistEntry,
} from "./types";

const DATA_DIR =
  process.env.NIGHTSHIFT_DATA_DIR ??
  (process.env.VERCEL ? "/tmp/nightshift-data" : path.join(process.cwd(), ".data"));

/** On Vercel, runs must use Postgres — /tmp is not shared across instances. */
export function assertPersistentStorage() {
  if (!process.env.VERCEL || usePostgres()) return;
  throw new Error(
    "Persistent storage is not configured. Connect Neon Postgres to this project, then redeploy so POSTGRES_URL is available at runtime.",
  );
}

function runKey(id: string) {
  return `runs/${id}.json`;
}

function analyticsKey() {
  return "analytics.json";
}

function waitlistKey() {
  return "waitlist.json";
}

async function ensureDir() {
  if (usePostgres()) return;
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export const STORAGE_ONLY_HEADER = "x-nightshift-storage-only";

async function readJsonFile<T>(key: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(DATA_DIR, key);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(key: string, value: unknown) {
  await ensureDir();
  const filePath = path.join(DATA_DIR, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

export async function saveRun(run: NightshiftRun) {
  run.updatedAt = new Date().toISOString();

  if (usePostgres()) {
    await withSql((sql) =>
      sql`
        INSERT INTO runs (id, payload, status, is_public, updated_at)
        VALUES (
          ${run.id},
          ${JSON.stringify(run)}::jsonb,
          ${run.status},
          ${run.isPublic},
          ${run.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          payload = EXCLUDED.payload,
          status = EXCLUDED.status,
          is_public = EXCLUDED.is_public,
          updated_at = EXCLUDED.updated_at
      `,
    );
    return;
  }

  await writeJsonFile(runKey(run.id), run);
}

export async function getRunFromStorage(id: string): Promise<NightshiftRun | null> {
  if (usePostgres()) {
    const rows = asRows<{ payload: NightshiftRun }>(
      await withSql((sql) => sql`SELECT payload FROM runs WHERE id = ${id}`),
    );
    return rows[0]?.payload ?? null;
  }

  return readJsonFile<NightshiftRun | null>(runKey(id), null);
}

export async function getRun(id: string): Promise<NightshiftRun | null> {
  return getRunFromStorage(id);
}

/** One engine per run across Vercel instances. Returns false if already claimed. */
export async function tryAcquireEngineLock(runId: string): Promise<boolean> {
  if (!usePostgres()) return true;

  const rows = asRows<{ run_id: string }>(
    await withSql((sql) =>
      sql`
        INSERT INTO engine_locks (run_id, claimed_at)
        VALUES (${runId}, NOW())
        ON CONFLICT (run_id) DO NOTHING
        RETURNING run_id
      `,
    ),
  );
  return rows.length > 0;
}

export async function releaseEngineLock(runId: string) {
  if (!usePostgres()) return;

  await withSql((sql) =>
    sql`DELETE FROM engine_locks WHERE run_id = ${runId}`,
  ).catch(() => {
    /* ignore */
  });
}

export async function listPublicRuns(limit = 20): Promise<NightshiftRun[]> {
  if (usePostgres()) {
    const rows = asRows<{ payload: NightshiftRun }>(
      await withSql((sql) =>
        sql`
          SELECT payload
          FROM runs
          WHERE is_public = true AND status = 'completed'
          ORDER BY updated_at DESC
          LIMIT ${limit}
        `,
      ),
    );
    return rows.map((row) => row.payload);
  }

  await ensureDir();
  const dir = path.join(DATA_DIR, "runs");
  try {
    const files = await fs.readdir(dir);
    const runs: NightshiftRun[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const run = JSON.parse(raw) as NightshiftRun;
      if (run.isPublic && run.status === "completed") runs.push(run);
    }
    return runs
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function appendAnalytics(event: AnalyticsEvent) {
  if (usePostgres()) {
    await withSql((sql) =>
      sql`
        INSERT INTO analytics_events (kind, payload, at)
        VALUES (${event.kind}, ${JSON.stringify(event)}::jsonb, ${event.at})
      `,
    );
    return;
  }

  const events = await readJsonFile<AnalyticsEvent[]>(analyticsKey(), []);
  events.push(event);
  await writeJsonFile(analyticsKey(), events);
}

export async function getAnalyticsSummary() {
  if (usePostgres()) {
    const rows = asRows<{ kind: string; count: number }>(
      await withSql((sql) =>
        sql`
          SELECT kind, COUNT(*)::int AS count
          FROM analytics_events
          GROUP BY kind
        `,
      ),
    );
    const counts = Object.fromEntries(rows.map((row) => [row.kind, row.count]));
    return {
      demoStarts: counts.demo_start ?? 0,
      demoFinishes: counts.demo_finish ?? 0,
      shareOpens: counts.share_open ?? 0,
      waitlistSignups: counts.waitlist_signup ?? 0,
    };
  }

  const events = await readJsonFile<AnalyticsEvent[]>(analyticsKey(), []);
  return {
    demoStarts: events.filter((e) => e.kind === "demo_start").length,
    demoFinishes: events.filter((e) => e.kind === "demo_finish").length,
    shareOpens: events.filter((e) => e.kind === "share_open").length,
    waitlistSignups: events.filter((e) => e.kind === "waitlist_signup").length,
  };
}

export async function addWaitlist(entry: WaitlistEntry) {
  if (usePostgres()) {
    await withSql((sql) =>
      sql`
        INSERT INTO waitlist (email, payload, at)
        VALUES (${entry.email}, ${JSON.stringify(entry)}::jsonb, ${entry.at})
        ON CONFLICT (email) DO NOTHING
      `,
    );
    return;
  }

  const entries = await readJsonFile<WaitlistEntry[]>(waitlistKey(), []);
  if (!entries.some((e) => e.email === entry.email)) {
    entries.push(entry);
    await writeJsonFile(waitlistKey(), entries);
  }
}

const portalProfilesKey = () => "portal-profiles.json";

export async function getPortalProfile(hostname: string): Promise<string | null> {
  if (usePostgres()) {
    const rows = asRows<{ profile_id: string }>(
      await withSql((sql) =>
        sql`
          SELECT profile_id
          FROM portal_profiles
          WHERE hostname = ${hostname}
        `,
      ),
    );
    return rows[0]?.profile_id ?? null;
  }

  const map = await readJsonFile<Record<string, string>>(portalProfilesKey(), {});
  return map[hostname] ?? null;
}

export async function savePortalProfile(hostname: string, profileId: string) {
  const updatedAt = new Date().toISOString();

  if (usePostgres()) {
    await withSql((sql) =>
      sql`
        INSERT INTO portal_profiles (hostname, profile_id, updated_at)
        VALUES (${hostname}, ${profileId}, ${updatedAt})
        ON CONFLICT (hostname) DO UPDATE SET
          profile_id = EXCLUDED.profile_id,
          updated_at = EXCLUDED.updated_at
      `,
    );
    return;
  }

  const map = await readJsonFile<Record<string, string>>(portalProfilesKey(), {});
  map[hostname] = profileId;
  await writeJsonFile(portalProfilesKey(), map);
}

/** Strip server-only fields before returning runs to the browser. */
export function sanitizeRunForClient(run: NightshiftRun): NightshiftRun {
  const { portalLoginCreds: _creds, ...safe } = run;
  return safe;
}

export async function deleteRun(id: string) {
  if (usePostgres()) {
    await withSql((sql) => sql`DELETE FROM runs WHERE id = ${id}`).catch(
      () => {},
    );
    return;
  }

  try {
    await fs.unlink(path.join(DATA_DIR, "runs", `${id}.json`));
  } catch {
    /* ignore */
  }
}
