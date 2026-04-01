/**
 * Purpose: Shared HTTP response helpers for JSON success and error responses.
 * Direct dependencies: none.
 * Inputs/Outputs: Plain data -> standardized HTTP Response.
 * Security: Never include secrets or sensitive internals in error details.
 * Notes: Keeps response format consistent across modules.
 */

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
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
