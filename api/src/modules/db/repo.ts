/**
 * Purpose: DB access for Postgres (Neon).
 * Direct dependencies: postgres client.
 * Inputs/Outputs: executes lightweight queries.
 * Security: requires DATABASE_URL secret (never log it).
 * Notes: Uses SSL required by Neon.
 */
import postgres from "postgres";

export type DbEnv = {
  DATABASE_URL: string;
};

export function makeDb(env: DbEnv) {
  const sql = postgres(env.DATABASE_URL, { ssl: "require" });

  return {
    async check() {
      await sql`select 1 as ok`;
      return { ok: true as const };
    },
  };
}
