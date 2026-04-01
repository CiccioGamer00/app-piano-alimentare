/**
 * Purpose: Shared role-based access control helpers.
 * Direct dependencies: auth role type.
 * Inputs/Outputs: current role + required role -> authorization boolean.
 * Security: Used by protected endpoints to enforce role minimums.
 * Notes: Higher rank means broader permissions.
 */

import type { AppRole } from "../../modules/auth/types";

const ROLE_RANK: Record<AppRole, number> = {
  patient: 1,
  assistant: 2,
  dietitian: 3,
  admin: 4,
  owner: 5,
};

/**
 * Preconditions: currentRole and requiredRole must be valid application roles.
 * Side effects: none.
 * Expected errors: none.
 */
export function hasRequiredRole(
  currentRole: AppRole,
  requiredRole: AppRole
): boolean {
  return ROLE_RANK[currentRole] >= ROLE_RANK[requiredRole];
}
