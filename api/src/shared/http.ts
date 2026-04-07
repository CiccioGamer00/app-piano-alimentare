/**
 * Purpose: Shared HTTP response helpers for JSON success, errors and CORS preflight responses.
 * Direct dependencies: none.
 * Inputs/Outputs: Plain data -> standardized HTTP Response.
 * Security: Never include secrets or sensitive internals in error details. CORS is intentionally open for local/frontend development.
 * Notes: Keeps response format consistent across modules and avoids per-controller CORS duplication.
 */

const DEFAULT_CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

function withCorsHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);

  for (const [key, value] of Object.entries(DEFAULT_CORS_HEADERS)) {
    result.set(key, value);
  }

  return result;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: withCorsHeaders({
      "content-type": "application/json; charset=utf-8",
    }),
  });
}

export function errorJson(
  code: string,
  message: string,
  status: number,
  details?: unknown
): Response {
  return json(
    {
      error: {
        code,
        message,
        details: details ?? null,
      },
    },
    status
  );
}

/**
 * Preconditions: request method should be OPTIONS.
 * Side effects: none.
 * Expected errors: none.
 */
export function corsPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: withCorsHeaders(),
  });
}
