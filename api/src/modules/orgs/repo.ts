/**
 * Purpose: Database access for organizations (tenants).
 * Direct dependencies: shared db factory.
 * Inputs/Outputs: org-related DB queries in and typed DB rows out.
 * Security: Org records are tenant boundaries and must be handled carefully.
 * Notes: Slug is unique and is used to identify organizations safely.
 */

import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";

export type OrgsRepoEnv = Env;

export type OrgRow = {
  id: string;
  slug: string;
  name: string;
  created_at: string;
};

export async function findOrgBySlug(env: OrgsRepoEnv, slug: string): Promise<OrgRow | null> {
  const sql = createDb(env);

  const rows = await sql<OrgRow[]>`
    select id, slug, name, created_at
    from orgs
    where slug = ${slug}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function createOrg(
  env: OrgsRepoEnv,
  input: {
    slug: string;
    name: string;
  }
): Promise<OrgRow> {
  const sql = createDb(env);

  const rows = await sql<OrgRow[]>`
    insert into orgs (
      slug,
      name
    )
    values (
      ${input.slug},
      ${input.name}
    )
    returning id, slug, name, created_at
  `;

  return rows[0];
}
