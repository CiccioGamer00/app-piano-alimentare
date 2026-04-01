/**
 * Purpose: DTOs and validation helpers for organization members management.
 * Direct dependencies: shared auth role type.
 * Inputs/Outputs: raw request payloads for org member creation and response DTOs for org member listing/creation.
 * Security: Handles user identity data and org role assignment inside the authenticated tenant only.
 * Notes: This module manages memberships for an existing org and must never allow cross-org assignment.
 */

import type { AppRole } from "../auth/types";

export type CreateOrgMemberBody = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: AppRole;
};

export type OrgMemberDto = {
  userId: string;
  orgId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
};

const ASSIGNABLE_ROLES: AppRole[] = ["admin", "dietitian", "assistant", "patient"];

function isValidRole(role: string): role is AppRole {
  return ["owner", "admin", "dietitian", "assistant", "patient"].includes(role);
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function validateCreateOrgMemberBody(body: CreateOrgMemberBody): CreateOrgMemberBody {
  if (!body.email || !body.password || !body.role) {
    throw new Error("email, password and role are required");
  }

  const email = body.email.trim().toLowerCase();

  if (!email.includes("@")) {
    throw new Error("email is invalid");
  }

  if (body.password.length < 8) {
    throw new Error("password must be at least 8 characters");
  }

  if (!isValidRole(body.role)) {
    throw new Error("role is invalid");
  }

  if (!ASSIGNABLE_ROLES.includes(body.role)) {
    throw new Error("role is not assignable");
  }

  return {
    email,
    password: body.password,
    firstName: normalizeOptionalString(body.firstName),
    lastName: normalizeOptionalString(body.lastName),
    role: body.role,
  };
}
