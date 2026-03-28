/**
 * Purpose: API entrypoint for Cloudflare Worker (local + deploy).
 * Direct dependencies: none (pure fetch handler).
 * Inputs/Outputs: HTTP Request -> HTTP Response (JSON/plain text).
 * Security: no auth yet; exposes only public health endpoint.
 * Notes: keep minimal; later we’ll add routing + auth + org_id.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
  return new Response(JSON.stringify({ ok: true, service: "api" }), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

    // Default
    return new Response("Not found", { status: 404 });
  },
};
