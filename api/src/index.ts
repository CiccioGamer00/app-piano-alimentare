/**
 * Purpose: API entrypoint and router.
 * Direct dependencies: feature controllers.
 * Inputs/Outputs: HTTP Request -> HTTP Response.
 * Security: Public router for now. Later will enforce org_id + RBAC.
 * Notes: Keep routing centralized; feature code stays in modules/.
 */
import { handleHealth } from "./modules/health/controller";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Public health (v1)
    if (url.pathname === "/v1/health") {
      return handleHealth();
    }

    // Backward compat (temporary): keep old /health working
    if (url.pathname === "/health") {
      return handleHealth();
    }

    return new Response("Not found", { status: 404 });
  },
};
