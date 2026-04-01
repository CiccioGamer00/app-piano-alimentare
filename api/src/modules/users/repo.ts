/**
 * Purpose: Database access for users.
 * Direct dependencies: shared db factory.
 * Inputs/Outputs: user-related DB queries in and typed DB rows out.
 * Security: Handles sensitive user data, including password_hash.
 * Notes: Keep all user SQL here to avoid duplication across services.
 */

import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";

export type UsersRepoEnv = Env;

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at: string;
};

export async function findUserByEmail(env: UsersRepoEnv, email: string): Promise<UserRow | null> {
  const sql = createDb(env);

  const rows = await sql<UserRow[]>`
    select id, email, password_hash, first_name, last_name, is_active, created_at
    from users
    where email = ${email}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function createUser(
  env: UsersRepoEnv,
  input: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
  }
): Promise<UserRow> {
  const sql = createDb(env);

  const rows = await sql<UserRow[]>`
    insert into users (
      email,
      password_hash,
      first_name,
      last_name
    )
    values (
      ${input.email},
      ${input.passwordHash},
      ${input.firstName ?? null},
      ${input.lastName ?? null}
    )
    returning id, email, password_hash, first_name, last_name, is_active, created_at
  `;

  return rows[0];
}
