/**
 * Purpose: Database access for patients within an organization scope.
 * Direct dependencies: shared db factory.
 * Inputs/Outputs: patient queries in and typed patient rows out.
 * Security: Every query must be scoped by org_id to enforce tenant isolation.
 * Notes: This module establishes the baseline multi-tenant query pattern for operational data.
 */

import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";

export type PatientsRepoEnv = Env;

export type PatientRow = {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  sex: "male" | "female" | "other" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function createPatient(
  env: PatientsRepoEnv,
  input: {
    orgId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    sex?: "male" | "female" | "other";
    notes?: string;
  }
): Promise<PatientRow> {
  const sql = createDb(env);

  const rows = await sql<PatientRow[]>`
    insert into patients (
      org_id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      sex,
      notes
    )
    values (
      ${input.orgId},
      ${input.firstName},
      ${input.lastName},
      ${input.email ?? null},
      ${input.phone ?? null},
      ${input.birthDate ?? null},
      ${input.sex ?? null},
      ${input.notes ?? null}
    )
    returning
      id,
      org_id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      sex,
      notes,
      created_at,
      updated_at
  `;

  return rows[0];
}

export async function listPatientsByOrgId(
  env: PatientsRepoEnv,
  orgId: string
): Promise<PatientRow[]> {
  const sql = createDb(env);

  const rows = await sql<PatientRow[]>`
    select
      id,
      org_id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      sex,
      notes,
      created_at,
      updated_at
    from patients
    where org_id = ${orgId}
    order by last_name asc, first_name asc, created_at desc
  `;

  return rows;
}

export async function findPatientByIdAndOrgId(
  env: PatientsRepoEnv,
  input: {
    patientId: string;
    orgId: string;
  }
): Promise<PatientRow | null> {
  const sql = createDb(env);

  const rows = await sql<PatientRow[]>`
    select
      id,
      org_id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      sex,
      notes,
      created_at,
      updated_at
    from patients
    where id = ${input.patientId}
      and org_id = ${input.orgId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function updatePatientByIdAndOrgId(
  env: PatientsRepoEnv,
  input: {
    patientId: string;
    orgId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    sex?: "male" | "female" | "other";
    notes?: string;
  }
): Promise<PatientRow | null> {
  const sql = createDb(env);

  const rows = await sql<PatientRow[]>`
    update patients
    set
      first_name = ${input.firstName},
      last_name = ${input.lastName},
      email = ${input.email ?? null},
      phone = ${input.phone ?? null},
      birth_date = ${input.birthDate ?? null},
      sex = ${input.sex ?? null},
      notes = ${input.notes ?? null},
      updated_at = now()
    where id = ${input.patientId}
      and org_id = ${input.orgId}
    returning
      id,
      org_id,
      first_name,
      last_name,
      email,
      phone,
      birth_date,
      sex,
      notes,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function deletePatientByIdAndOrgId(
  env: PatientsRepoEnv,
  input: {
    patientId: string;
    orgId: string;
  }
): Promise<boolean> {
  const sql = createDb(env);

  const rows = await sql<{ id: string }[]>`
    delete from patients
    where id = ${input.patientId}
      and org_id = ${input.orgId}
    returning id
  `;

  return rows.length > 0;
}
