/**
 * Purpose: Database access for user-organization memberships and roles.
 * Direct dependencies: shared db factory.
 * Inputs/Outputs: membership queries in and typed DB rows out.
 * Security: Membership rows define tenant access and RBAC.
 * Notes: Every operational area will rely on these relations later.
 */

import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";

export type MembershipsRepoEnv = Env;

export type AppRole = "owner" | "admin" | "dietitian" | "assistant" | "patient";

export type MembershipRow = {
  id: string;
  user_id: string;
  org_id: string;
  role: AppRole;
  created_at: string;
};

export type UserOrganizationRow = {
  org_id: string;
  org_slug: string;
  org_name: string;
  role: AppRole;
};

export type OrganizationMemberRow = {
  user_id: string;
  org_id: string;
  role: AppRole;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at: string;
};

export async function createMembership(
  env: MembershipsRepoEnv,
  input: {
    userId: string;
    orgId: string;
    role: AppRole;
  }
): Promise<MembershipRow> {
  const sql = createDb(env);

  const rows = await sql<MembershipRow[]>`
    insert into user_org_roles (
      user_id,
      org_id,
      role
    )
    values (
      ${input.userId},
      ${input.orgId},
      ${input.role}
    )
    returning id, user_id, org_id, role, created_at
  `;

  return rows[0];
}

export async function findMembershipsByUserId(
  env: MembershipsRepoEnv,
  userId: string
): Promise<UserOrganizationRow[]> {
  const sql = createDb(env);

  const rows = await sql<UserOrganizationRow[]>`
    select
      uor.org_id,
      o.slug as org_slug,
      o.name as org_name,
      uor.role
    from user_org_roles uor
    inner join orgs o on o.id = uor.org_id
    where uor.user_id = ${userId}
    order by o.name asc
  `;

  return rows;
}

export async function findMembershipByUserIdAndOrgSlug(
  env: MembershipsRepoEnv,
  input: {
    userId: string;
    orgSlug: string;
  }
): Promise<UserOrganizationRow | null> {
  const sql = createDb(env);

  const rows = await sql<UserOrganizationRow[]>`
    select
      uor.org_id,
      o.slug as org_slug,
      o.name as org_name,
      uor.role
    from user_org_roles uor
    inner join orgs o on o.id = uor.org_id
    where uor.user_id = ${input.userId}
      and o.slug = ${input.orgSlug}
    limit 1
  `;

  return rows[0] ?? null;
}

/**
 * Preconditions: userId and orgId must be valid identifiers.
 * Side effects: none.
 * Expected errors: none.
 */
export async function findMembershipByUserIdAndOrgId(
  env: MembershipsRepoEnv,
  input: {
    userId: string;
    orgId: string;
  }
): Promise<MembershipRow | null> {
  const sql = createDb(env);

  const rows = await sql<MembershipRow[]>`
    select
      id,
      user_id,
      org_id,
      role,
      created_at
    from user_org_roles
    where user_id = ${input.userId}
      and org_id = ${input.orgId}
    limit 1
  `;

  return rows[0] ?? null;
}

/**
 * Preconditions: orgId must be a valid organization identifier.
 * Side effects: none.
 * Expected errors: none.
 */
export async function listMembersByOrgId(
  env: MembershipsRepoEnv,
  orgId: string
): Promise<OrganizationMemberRow[]> {
  const sql = createDb(env);

  const rows = await sql<OrganizationMemberRow[]>`
    select
      u.id as user_id,
      uor.org_id,
      uor.role,
      u.email,
      u.first_name,
      u.last_name,
      u.is_active,
      uor.created_at
    from user_org_roles uor
    inner join users u on u.id = uor.user_id
    where uor.org_id = ${orgId}
    order by
      uor.created_at asc,
      u.email asc
  `;

  return rows;
}
