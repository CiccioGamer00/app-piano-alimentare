/**
 * Purpose: Business logic for listing and creating organization members inside the authenticated org.
 * Direct dependencies: users repo, memberships repo, auth request context, password hashing, RBAC helpers and org-members DTO validation.
 * Inputs/Outputs: auth context + create member DTO in -> org member DTO(s) out.
 * Security: Enforces org scoping through auth.orgId and allows member management only to admin-level roles inside the same org.
 * Notes: Reuses existing users when possible but forbids duplicate memberships in the same organization.
 */

import type { Env } from "../../shared/db";
import type { RequestAuthContext } from "../../shared/auth/request-context";
import { hasRequiredRole } from "../../shared/auth/rbac";
import { hashPassword } from "../../shared/auth/password";
import { AuthServiceError } from "../auth/service";
import { createUser, findUserByEmail } from "../users/repo";
import {
  createMembership,
  findMembershipByUserIdAndOrgId,
  listMembersByOrgId,
} from "../memberships/repo";
import {
  validateCreateOrgMemberBody,
  type CreateOrgMemberBody,
  type OrgMemberDto,
} from "./types";

function mapOrgMemberRowToDto(row: {
  user_id: string;
  org_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "owner" | "admin" | "dietitian" | "assistant" | "patient";
  is_active: boolean;
  created_at: string;
}): OrgMemberDto {
  return {
    userId: row.user_id,
    orgId: row.org_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

/**
 * Preconditions: auth must come from a validated bearer token.
 * Side effects: none.
 * Expected errors: FORBIDDEN when the authenticated role is below admin.
 */
function ensureOrgMembersManageAccess(auth: RequestAuthContext): void {
  if (!hasRequiredRole(auth.role, "admin")) {
    throw new AuthServiceError(
      "FORBIDDEN",
      "You do not have permission to manage organization members",
      403
    );
  }
}

/**
 * Preconditions: auth must come from a validated bearer token with admin-level role.
 * Side effects: none.
 * Expected errors: FORBIDDEN.
 */
export async function listOrgMembersForOrganization(
  env: Env,
  auth: RequestAuthContext
): Promise<OrgMemberDto[]> {
  ensureOrgMembersManageAccess(auth);

  const rows = await listMembersByOrgId(env, auth.orgId);
  return rows.map(mapOrgMemberRowToDto);
}

/**
 * Preconditions: auth must come from a validated bearer token with admin-level role and body must be valid.
 * Side effects: may create a new user and always creates one membership inside auth.orgId when successful.
 * Expected errors: FORBIDDEN, VALIDATION_ERROR, MEMBER_ALREADY_EXISTS_IN_ORG, USER_ALREADY_EXISTS_WITH_DIFFERENT_NAME.
 */
export async function createOrgMemberForOrganization(
  env: Env,
  auth: RequestAuthContext,
  body: CreateOrgMemberBody
): Promise<OrgMemberDto> {
  ensureOrgMembersManageAccess(auth);

  let validatedBody: CreateOrgMemberBody;

  try {
    validatedBody = validateCreateOrgMemberBody(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid organization member payload";
    throw new AuthServiceError("VALIDATION_ERROR", message, 400);
  }

  const existingUser = await findUserByEmail(env, validatedBody.email);

  let userId: string;
  let email: string;
  let firstName: string | null;
  let lastName: string | null;
  let isActive: boolean;

  if (existingUser) {
    const existingMembership = await findMembershipByUserIdAndOrgId(env, {
      userId: existingUser.id,
      orgId: auth.orgId,
    });

    if (existingMembership) {
      throw new AuthServiceError(
        "MEMBER_ALREADY_EXISTS_IN_ORG",
        "This user already belongs to the active organization",
        409
      );
    }

    userId = existingUser.id;
    email = existingUser.email;
    firstName = existingUser.first_name;
    lastName = existingUser.last_name;
    isActive = existingUser.is_active;
  } else {
    const passwordHash = await hashPassword(validatedBody.password);

    const createdUser = await createUser(env, {
      email: validatedBody.email,
      passwordHash,
      firstName: validatedBody.firstName,
      lastName: validatedBody.lastName,
    });

    userId = createdUser.id;
    email = createdUser.email;
    firstName = createdUser.first_name;
    lastName = createdUser.last_name;
    isActive = createdUser.is_active;
  }

  const membership = await createMembership(env, {
    userId,
    orgId: auth.orgId,
    role: validatedBody.role,
  });

  return {
    userId,
    orgId: auth.orgId,
    email,
    firstName,
    lastName,
    role: membership.role,
    isActive,
    createdAt: membership.created_at,
  };
}
