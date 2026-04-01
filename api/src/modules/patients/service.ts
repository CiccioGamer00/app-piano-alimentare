/**
 * Purpose: Business logic for creating and managing patients inside the authenticated organization.
 * Direct dependencies: patients repo, request auth context, patients validation types and shared RBAC helpers.
 * Inputs/Outputs: auth context + patient DTOs in -> patient DTOs out.
 * Security: Uses auth.orgId as mandatory tenant boundary and enforces minimum role for patient management.
 * Notes: This is the reference implementation for future multi-tenant operational modules.
 */

import type { Env } from "../../shared/db";
import type { RequestAuthContext } from "../../shared/auth/request-context";
import { hasRequiredRole } from "../../shared/auth/rbac";
import {
  createPatient,
  deletePatientByIdAndOrgId,
  findPatientByIdAndOrgId,
  listPatientsByOrgId,
  updatePatientByIdAndOrgId,
} from "./repo";
import {
  validateCreatePatientBody,
  validateUpdatePatientBody,
  type CreatePatientBody,
  type PatientDto,
  type UpdatePatientBody,
} from "./types";
import { AuthServiceError } from "../auth/service";

function mapPatientRowToDto(row: {
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
}): PatientDto {
  return {
    id: row.id,
    orgId: row.org_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    birthDate: row.birth_date,
    sex: row.sex,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below the required minimum.
 */
function ensurePatientsWriteAccess(auth: RequestAuthContext): void {
  if (!hasRequiredRole(auth.role, "assistant")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to manage patients",
      403
    );
  }
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below the required minimum.
 */
function ensurePatientsReadAccess(auth: RequestAuthContext): void {
  if (!hasRequiredRole(auth.role, "assistant")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to access patients",
      403
    );
  }
}

/**
 * Preconditions: auth must come from a validated bearer token and body must contain a valid patient payload.
 * Side effects: writes one patient row to the patients table scoped to auth.orgId.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR when required patient fields are missing or invalid.
 */
export async function createPatientForOrganization(
  env: Env,
  auth: RequestAuthContext,
  body: CreatePatientBody
): Promise<PatientDto> {
  ensurePatientsWriteAccess(auth);

  try {
    validateCreatePatientBody(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid patient payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const createdPatient = await createPatient(env, {
    orgId: auth.orgId,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
    birthDate: body.birthDate?.trim() || undefined,
    sex: body.sex,
    notes: body.notes?.trim() || undefined,
  });

  return mapPatientRowToDto(createdPatient);
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN.
 */
export async function listPatientsForOrganization(
  env: Env,
  auth: RequestAuthContext
): Promise<PatientDto[]> {
  ensurePatientsReadAccess(auth);

  const rows = await listPatientsByOrgId(env, auth.orgId);
  return rows.map(mapPatientRowToDto);
}

/**
 * Preconditions: auth must come from a validated bearer token and patientId must be a valid string.
 * Side effects: none.
 * Expected errors: FORBIDDEN, PATIENT_NOT_FOUND when the patient does not exist inside auth.orgId.
 */
export async function getPatientForOrganization(
  env: Env,
  auth: RequestAuthContext,
  patientId: string
): Promise<PatientDto> {
  ensurePatientsReadAccess(auth);

  const patient = await findPatientByIdAndOrgId(env, {
    patientId,
    orgId: auth.orgId,
  });

  if (!patient) {
    throw new AuthServiceError(
      "PATIENT_NOT_FOUND",
      "Patient not found",
      404
    );
  }

  return mapPatientRowToDto(patient);
}

/**
 * Preconditions: auth must come from a validated bearer token, patientId must be valid and body must contain at least one valid field.
 * Side effects: updates one patient row inside auth.orgId.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, PATIENT_NOT_FOUND.
 */
export async function updatePatientForOrganization(
  env: Env,
  auth: RequestAuthContext,
  patientId: string,
  body: UpdatePatientBody
): Promise<PatientDto> {
  ensurePatientsWriteAccess(auth);

  try {
    validateUpdatePatientBody(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid patient payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const existingPatient = await findPatientByIdAndOrgId(env, {
    patientId,
    orgId: auth.orgId,
  });

  if (!existingPatient) {
    throw new AuthServiceError(
      "PATIENT_NOT_FOUND",
      "Patient not found",
      404
    );
  }

  const updatedPatient = await updatePatientByIdAndOrgId(env, {
    patientId,
    orgId: auth.orgId,
    firstName:
      body.firstName !== undefined
        ? body.firstName.trim()
        : existingPatient.first_name,
    lastName:
      body.lastName !== undefined
        ? body.lastName.trim()
        : existingPatient.last_name,
    email:
      body.email !== undefined
        ? body.email?.trim() || undefined
        : existingPatient.email ?? undefined,
    phone:
      body.phone !== undefined
        ? body.phone?.trim() || undefined
        : existingPatient.phone ?? undefined,
    birthDate:
      body.birthDate !== undefined
        ? body.birthDate?.trim() || undefined
        : existingPatient.birth_date ?? undefined,
    sex:
      body.sex !== undefined
        ? body.sex ?? undefined
        : existingPatient.sex ?? undefined,
    notes:
      body.notes !== undefined
        ? body.notes?.trim() || undefined
        : existingPatient.notes ?? undefined,
  });

  if (!updatedPatient) {
    throw new AuthServiceError(
      "PATIENT_NOT_FOUND",
      "Patient not found",
      404
    );
  }

  return mapPatientRowToDto(updatedPatient);
}

/**
 * Preconditions: auth must come from a validated bearer token and patientId must be valid.
 * Side effects: deletes one patient row inside auth.orgId.
 * Expected errors: FORBIDDEN, PATIENT_NOT_FOUND.
 */
export async function deletePatientForOrganization(
  env: Env,
  auth: RequestAuthContext,
  patientId: string
): Promise<void> {
  ensurePatientsWriteAccess(auth);

  const deleted = await deletePatientByIdAndOrgId(env, {
    patientId,
    orgId: auth.orgId,
  });

  if (!deleted) {
    throw new AuthServiceError(
      "PATIENT_NOT_FOUND",
      "Patient not found",
      404
    );
  }
}
