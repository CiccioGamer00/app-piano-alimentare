/**
 * Purpose: Regression tests for public routing, CORS and protected-route boundaries.
 * Direct dependencies: Cloudflare Workers Vitest pool and the API worker entrypoint.
 * Inputs/Outputs: synthetic HTTP requests -> asserted HTTP status, headers and JSON payloads.
 * Security: Verifies that protected routes reject unauthenticated requests without touching production data.
 * Notes: Database-backed integration tests will be added with an isolated test database.
 */

import {
  SELF,
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("API routing baseline", () => {
  it("returns the health payload through the worker entrypoint", async () => {
    const request = new IncomingRequest("https://example.com/v1/health");
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    await expect(response.json()).resolves.toEqual({ ok: true, service: "api" });
  });

  it("returns the same health payload through the integration binding", async () => {
    const response = await SELF.fetch("https://example.com/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, service: "api" });
  });

  it("handles CORS preflight without invoking a feature controller", async () => {
    const response = await SELF.fetch("https://example.com/v1/patients", {
      method: "OPTIONS",
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-allow-methods")).toContain("PATCH");
    expect(response.headers.get("access-control-allow-headers")).toContain(
      "Authorization"
    );
  });

  it("rejects a protected route when the bearer token is missing", async () => {
    const response = await SELF.fetch("https://example.com/v1/auth/me");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing Authorization header",
        details: null,
      },
    });
  });

  it("returns a standardized not-found response for unknown routes", async () => {
    const response = await SELF.fetch("https://example.com/v1/unknown");

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8"
    );
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        details: null,
      },
    });
  });
});
