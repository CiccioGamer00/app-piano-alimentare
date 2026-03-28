/**
 * Purpose: Business logic for health feature.
 * Direct dependencies: health repo.
 * Inputs/Outputs: returns HealthResponse.
 * Security: no auth required.
 * Notes: Later can include deeper checks (DB, queue, etc.).
 */
import type { HealthResponse } from "./types";
import { getHealthStatus } from "./repo";

export function healthService(): HealthResponse {
  // Preconditions: none
  // Side effects: none
  // Expected errors: none
  return getHealthStatus();
}
