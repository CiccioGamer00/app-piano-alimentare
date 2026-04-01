/**
 * Purpose: DTOs and validation helpers for patients module.
 * Direct dependencies: none.
 * Inputs/Outputs: raw request payloads and DB-shaped DTOs for patients.
 * Security: Contains patient personal data and must be handled only within the authenticated org scope.
 * Notes: Validation is intentionally simple for the first version.
 */

export type CreatePatientBody = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  sex?: "male" | "female" | "other";
  notes?: string;
};

export type UpdatePatientBody = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  sex?: "male" | "female" | "other" | null;
  notes?: string | null;
};

export type PatientDto = {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  sex: "male" | "female" | "other" | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function validateCreatePatientBody(body: CreatePatientBody): void {
  if (!body.firstName || !body.lastName) {
    throw new Error("firstName and lastName are required");
  }

  if (body.sex && !["male", "female", "other"].includes(body.sex)) {
    throw new Error("sex is invalid");
  }
}

export function validateUpdatePatientBody(body: UpdatePatientBody): void {
  const hasAtLeastOneField =
    body.firstName !== undefined ||
    body.lastName !== undefined ||
    body.email !== undefined ||
    body.phone !== undefined ||
    body.birthDate !== undefined ||
    body.sex !== undefined ||
    body.notes !== undefined;

  if (!hasAtLeastOneField) {
    throw new Error("at least one field must be provided");
  }

  if (body.firstName !== undefined && !body.firstName.trim()) {
    throw new Error("firstName cannot be empty");
  }

  if (body.lastName !== undefined && !body.lastName.trim()) {
    throw new Error("lastName cannot be empty");
  }

  if (
    body.sex !== undefined &&
    body.sex !== null &&
    !["male", "female", "other"].includes(body.sex)
  ) {
    throw new Error("sex is invalid");
  }
}
