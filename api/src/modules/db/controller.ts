/**
 * Purpose: HTTP controller for DB connectivity check.
 * Direct dependencies: db repo factory.
 * Inputs/Outputs: env -> Response JSON.
 * Security: public for now; returns only ok boolean.
 * Notes: Useful for verifying Neon connectivity.
 */
import type { DbEnv } from "./repo";
import { makeDb } from "./repo";

export async function handleDbCheck(env: DbEnv): Promise<Response> {
  const db = makeDb(env);
  const data = await db.check();

  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}
