/**
 * Purpose: HTTP controller for DB connectivity check.
 * Direct dependencies: db repo factory and shared HTTP helpers.
 * Inputs/Outputs: env -> JSON Response with DB health result.
 * Security: Public for now; returns only minimal status information.
 * Notes: Catches DB errors explicitly to avoid leaking noisy local dev stack traces.
 */

import type { DbEnv } from "./repo";
import { makeDb } from "./repo";
import { errorJson, json } from "../../shared/http";

export async function handleDbCheck(env: DbEnv): Promise<Response> {
  try {
    const db = makeDb(env);
    const data = await db.check();

    return json(data, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return errorJson("DB_CHECK_FAILED", message, 500);
  }
}
