/**
 * Purpose: Creates and verifies signed auth tokens for API access.
 * Direct dependencies: shared db Env type.
 * Inputs/Outputs: auth payload <-> signed token string.
 * Security: Uses JWT_SECRET to sign tokens; never expose the secret.
 * Notes: This is a simple HMAC-SHA256 JWT implementation for Workers.
 */

import type { Env } from "../db";
import type { AppRole } from "../../modules/auth/types";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  org_id: string;
  role: AppRole;
  iat: number;
  exp: number;
};

function toBase64Url(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return toBase64Url(new Uint8Array(signature));
}

/**
 * Preconditions: env.JWT_SECRET must be present and payload fields must be valid.
 * Side effects: none.
 * Expected errors: throws if JWT_SECRET is missing or crypto operations fail.
 */
export async function createAccessToken(
  env: Env,
  input: {
    userId: string;
    email: string;
    orgId: string;
    role: AppRole;
    expiresInSeconds?: number;
  }
): Promise<string> {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (input.expiresInSeconds ?? 60 * 60 * 8);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload: AuthTokenPayload = {
    sub: input.userId,
    email: input.email,
    org_id: input.orgId,
    role: input.role,
    iat: now,
    exp,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = await signValue(unsignedToken, env.JWT_SECRET);

  return `${unsignedToken}.${signature}`;
}

/**
 * Preconditions: token must be a JWT-like string.
 * Side effects: none.
 * Expected errors: returns null for invalid, malformed, or expired tokens.
 */
export async function verifyAccessToken(
  env: Env,
  token: string
): Promise<AuthTokenPayload | null> {
  if (!env.JWT_SECRET || !token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = await signValue(unsignedToken, env.JWT_SECRET);

  if (providedSignature !== expectedSignature) {
    return null;
  }

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson) as AuthTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now) {
      return null;
    }

    if (!payload.sub || !payload.email || !payload.org_id || !payload.role) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
