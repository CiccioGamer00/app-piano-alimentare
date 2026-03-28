/**
 * Purpose: DTOs and validation for health feature.
 * Direct dependencies: none.
 * Inputs/Outputs: defines response shape for /v1/health.
 * Security: no sensitive data.
 * Notes: Keep stable for monitoring.
 */
export type HealthResponse = {
  ok: true;
  service: "api";
};
