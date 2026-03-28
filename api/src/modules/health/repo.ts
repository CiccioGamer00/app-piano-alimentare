/**
 * Purpose: Data access layer for health feature.
 * Direct dependencies: none (no DB yet).
 * Inputs/Outputs: returns basic service status data.
 * Security: no sensitive data.
 * Notes: Later can include DB connectivity checks.
 */
import type { HealthResponse } from "./types";

export function getHealthStatus(): HealthResponse {
  return { ok: true, service: "api" };
}
