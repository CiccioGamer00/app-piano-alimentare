/**
 * Purpose: HTTP controller for health endpoints.
 * Direct dependencies: health service.
 * Inputs/Outputs: Request -> Response (JSON).
 * Security: public endpoint (no auth).
 * Notes: Adds CORS header for browser clients.
 */
import { healthService } from "./service";

export function handleHealth(): Response {
  const data = healthService();
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}
