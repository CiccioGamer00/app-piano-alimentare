/**
 * Purpose: Centralized database client factory for Neon Postgres.
 * Direct dependencies: postgres package.
 * Inputs/Outputs: Cloudflare env -> postgres sql client.
 * Security: Uses DATABASE_URL secret and must never expose it in responses.
 * Notes: Shared by all modules to avoid duplicating DB connection logic.
 */

import postgres from "postgres";

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export function createDb(env: Env) {
  return postgres(env.DATABASE_URL, {
    ssl: "require",
  });
}
