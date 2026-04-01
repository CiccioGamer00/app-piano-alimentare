/**
 * Purpose: HTTP controller for patients endpoints.
 * Direct dependencies: auth middleware, patients service and shared HTTP helpers.
 * Inputs/Outputs: HTTP Request with bearer token and optional JSON body -> HTTP JSON Response.
 * Security: All endpoints require authentication and are always scoped to auth.orgId.
 * Notes: This module demonstrates the standard protected multi-tenant controller flow.
 */

import type { Env } from "../../shared/db";
import { requireAuth } from "../../shared/auth/middleware";
import { errorJson, json } from "../../shared/http";
import { AuthServiceError } from "../auth/service";
import {
  createPatientForOrganization,
  deletePatientForOrganization,
  getPatientForOrganization,
  listPatientsForOrganization,
  updatePatientForOrganization,
} from "./service";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AuthServiceError(
      "INVALID_JSON",
      "Request body must be valid JSON",
      400
    );
  }
}

function getPatientIdFromPath(request: Request): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length === 3 && parts[0] === "v1" && parts[1] === "patients") {
    return parts[2];
  }

  return null;
}

/**
 * Preconditions: request method must be POST, token must be valid and body must contain valid patient data.
 * Side effects: creates one patient row in the authenticated org.
 * Expected errors: UNAUTHORIZED, INVALID_JSON, VALIDATION_ERROR.
 */
export async function handleCreatePatient(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const patient = await createPatientForOrganization(
      env,
      auth,
      body as Parameters<typeof createPatientForOrganization>[2]
    );

    return json(patient, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET and token must be valid.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED.
 */
export async function handleListPatients(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  try {
    const auth = await requireAuth(request, env);
    const patients = await listPatientsForOrganization(env, auth);

    return json(
      {
        items: patients,
      },
      200
    );
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be GET, token must be valid and the URL must contain a patient id.
 * Side effects: none.
 * Expected errors: UNAUTHORIZED, PATIENT_ID_REQUIRED, PATIENT_NOT_FOUND.
 */
export async function handleGetPatient(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const patientId = getPatientIdFromPath(request);
  if (!patientId) {
    return errorJson("PATIENT_ID_REQUIRED", "Patient id is required", 400);
  }

  try {
    const auth = await requireAuth(request, env);
    const patient = await getPatientForOrganization(env, auth, patientId);

    return json(patient, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be PATCH, token must be valid, the URL must contain a patient id and body must be valid.
 * Side effects: updates one patient row in the authenticated org.
 * Expected errors: UNAUTHORIZED, PATIENT_ID_REQUIRED, INVALID_JSON, VALIDATION_ERROR, PATIENT_NOT_FOUND.
 */
export async function handleUpdatePatient(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "PATCH") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const patientId = getPatientIdFromPath(request);
  if (!patientId) {
    return errorJson("PATIENT_ID_REQUIRED", "Patient id is required", 400);
  }

  try {
    const auth = await requireAuth(request, env);
    const body = await readJsonBody(request);
    const patient = await updatePatientForOrganization(
      env,
      auth,
      patientId,
      body as Parameters<typeof updatePatientForOrganization>[3]
    );

    return json(patient, 200);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

/**
 * Preconditions: request method must be DELETE, token must be valid and the URL must contain a patient id.
 * Side effects: deletes one patient row from the authenticated org.
 * Expected errors: UNAUTHORIZED, PATIENT_ID_REQUIRED, PATIENT_NOT_FOUND.
 */
export async function handleDeletePatient(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "DELETE") {
    return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const patientId = getPatientIdFromPath(request);
  if (!patientId) {
    return errorJson("PATIENT_ID_REQUIRED", "Patient id is required", 400);
  }

  try {
    const auth = await requireAuth(request, env);
    await deletePatientForOrganization(env, auth, patientId);

    return json(
      {
        ok: true,
      },
      200
    );
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorJson(error.code, error.message, error.status);
    }

    return errorJson("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
