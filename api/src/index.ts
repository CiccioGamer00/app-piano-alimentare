/**
 * Purpose: API entrypoint and router.
 * Direct dependencies: feature controllers.
 * Inputs/Outputs: HTTP Request -> HTTP Response.
 * Security: Public router for now. Later will enforce org_id + RBAC.
 * Notes: Keep routing centralized; feature code stays in modules/.
 */
import { handleHealth } from "./modules/health/controller";
import { handleDbCheck } from "./modules/db/controller";

type Env = {
  DATABASE_URL: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/v1/health" || url.pathname === "/health") {
      return handleHealth();
    }

    if (url.pathname === "/v1/db-check") {
      return await handleDbCheck(env);
    }

    return new Response("Not found", { status: 404 });
  },
};
