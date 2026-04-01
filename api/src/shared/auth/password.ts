/**
 * Purpose: Hashes and verifies passwords using the Web Crypto API available in Cloudflare Workers.
 * Direct dependencies: none.
 * Inputs/Outputs: plain password -> stored hash string, and plain password + stored hash -> boolean.
 * Security: Handles sensitive credentials and must never log raw passwords or hashes.
 * Notes: Uses PBKDF2 with SHA-256 and a random salt. Stored format is versioned for future changes.
 */

const ITERATIONS = 210_000;
const SALT_LENGTH = 16;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function deriveHash(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: ITERATIONS,
    },
    key,
    256
  );

  return new Uint8Array(bits);
}

/**
 * Preconditions: password must be a non-empty string.
 * Side effects: none.
 * Expected errors: throws if Web Crypto is unavailable or password is invalid.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error("Password is required");
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveHash(password, salt);

  return `pbkdf2_sha256$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/**
 * Preconditions: password and storedHash must be non-empty strings.
 * Side effects: none.
 * Expected errors: returns false for malformed stored hashes or unsupported formats.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  const parts = storedHash.split("$");
  if (parts.length !== 4) {
    return false;
  }

  const [algorithm, iterationText, saltBase64, hashBase64] = parts;

  if (algorithm !== "pbkdf2_sha256") {
    return false;
  }

  const iterations = Number(iterationText);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const salt = fromBase64(saltBase64);
  const expectedHash = fromBase64(hashBase64);
  const actualHash = await deriveHash(password, salt);

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash[i] ^ expectedHash[i];
  }

  return diff === 0;
}
