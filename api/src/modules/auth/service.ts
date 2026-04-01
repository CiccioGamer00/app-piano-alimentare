/**
 * Purpose: Business logic for auth register and login flows.
 * Direct dependencies: users/orgs/memberships repos, password hashing, token creation.
 * Inputs/Outputs: register/login DTOs in -> auth success DTOs out.
 * Security: Handles credentials, creates tenant ownership, and issues access tokens.
 * Notes: Register creates a new org and assigns the creator as owner.
 */

import {
  createUser,
  findUserByEmail,
} from "../users/repo";
import {
  createOrg,
  findOrgBySlug,
} from "../orgs/repo";
import {
  createMembership,
  findMembershipsByUserId,
  findMembershipByUserIdAndOrgSlug,
} from "../memberships/repo";
import { hashPassword, verifyPassword } from "../../shared/auth/password";
import { createAccessToken } from "../../shared/auth/token";
import { createDb } from "../../shared/db";
import type { Env } from "../../shared/db";
import type {
  LoginBody,
  LoginSuccessResponse,
  RegisterBody,
  RegisterSuccessResponse,
} from "./types";

export class AuthServiceError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeOrgSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function validateRegisterBody(body: RegisterBody): void {
  if (!body.email || !body.password || !body.orgName || !body.orgSlug) {
    throw new AuthServiceError(
      "VALIDATION_ERROR",
      "email, password, orgName and orgSlug are required",
      400
    );
  }

  if (!body.email.includes("@")) {
    throw new AuthServiceError(
      "VALIDATION_ERROR",
      "email is invalid",
      400
    );
  }

  if (body.password.length < 8) {
    throw new AuthServiceError(
      "VALIDATION_ERROR",
      "password must be at least 8 characters",
      400
    );
  }

  if (!/^[a-z0-9-]+$/.test(body.orgSlug.trim().toLowerCase())) {
    throw new AuthServiceError(
      "VALIDATION_ERROR",
      "orgSlug can contain only lowercase letters, numbers and hyphens",
      400
    );
  }
}

function validateLoginBody(body: LoginBody): void {
  if (!body.email || !body.password) {
    throw new AuthServiceError(
      "VALIDATION_ERROR",
      "email and password are required",
      400
    );
  }

  if (!body.email.includes("@")) {
    throw new AuthServiceError(
      "VALIDATION_ERROR",
      "email is invalid",
      400
    );
  }
}

/**
 * Preconditions: body must contain valid register fields and env secrets must be configured.
 * Side effects: writes to users, orgs and user_org_roles tables; creates an access token.
 * Expected errors: VALIDATION_ERROR, EMAIL_ALREADY_EXISTS, ORG_SLUG_ALREADY_EXISTS.
 */
export async function register(
  env: Env,
  body: RegisterBody
): Promise<RegisterSuccessResponse> {
  validateRegisterBody(body);

  const email = normalizeEmail(body.email);
  const orgSlug = normalizeOrgSlug(body.orgSlug);
  const orgName = body.orgName.trim();
  const firstName = body.firstName?.trim() || undefined;
  const lastName = body.lastName?.trim() || undefined;

  const existingUser = await findUserByEmail(env, email);
  if (existingUser) {
    throw new AuthServiceError(
      "EMAIL_ALREADY_EXISTS",
      "A user with this email already exists",
      409
    );
  }

  const existingOrg = await findOrgBySlug(env, orgSlug);
  if (existingOrg) {
    throw new AuthServiceError(
      "ORG_SLUG_ALREADY_EXISTS",
      "An organization with this slug already exists",
      409
    );
  }

  const passwordHash = await hashPassword(body.password);

  const sql = createDb(env);

  const result = await sql.begin(async () => {
    const createdUser = await createUser(env, {
      email,
      passwordHash,
      firstName,
      lastName,
    });

    const createdOrg = await createOrg(env, {
      slug: orgSlug,
      name: orgName,
    });

    const createdMembership = await createMembership(env, {
      userId: createdUser.id,
      orgId: createdOrg.id,
      role: "owner",
    });

    return {
      createdUser,
      createdOrg,
      createdMembership,
    };
  });

  const accessToken = await createAccessToken(env, {
    userId: result.createdUser.id,
    email: result.createdUser.email,
    orgId: result.createdOrg.id,
    role: result.createdMembership.role,
  });

  return {
    user: {
      id: result.createdUser.id,
      email: result.createdUser.email,
      firstName: result.createdUser.first_name,
      lastName: result.createdUser.last_name,
    },
    org: {
      id: result.createdOrg.id,
      slug: result.createdOrg.slug,
      name: result.createdOrg.name,
    },
    membership: {
      role: result.createdMembership.role,
    },
    accessToken,
  };
}

/**
 * Preconditions: body must contain valid login fields and the user must already exist.
 * Side effects: creates an access token.
 * Expected errors: VALIDATION_ERROR, INVALID_CREDENTIALS, USER_INACTIVE, ORG_SELECTION_REQUIRED, ORG_NOT_FOUND_FOR_USER.
 */
export async function login(
  env: Env,
  body: LoginBody
): Promise<LoginSuccessResponse> {
  validateLoginBody(body);

  const email = normalizeEmail(body.email);
  const orgSlug = body.orgSlug ? normalizeOrgSlug(body.orgSlug) : undefined;

  const user = await findUserByEmail(env, email);
  if (!user) {
    throw new AuthServiceError(
      "INVALID_CREDENTIALS",
      "Invalid email or password",
      401
    );
  }

  if (!user.is_active) {
    throw new AuthServiceError(
      "USER_INACTIVE",
      "User is inactive",
      403
    );
  }

  const isPasswordValid = await verifyPassword(body.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthServiceError(
      "INVALID_CREDENTIALS",
      "Invalid email or password",
      401
    );
  }

  const organizations = await findMembershipsByUserId(env, user.id);

  if (organizations.length === 0) {
    throw new AuthServiceError(
      "NO_ORGANIZATIONS",
      "User does not belong to any organization",
      403
    );
  }

  let activeOrganization:
  | {
      org_id: string;
      org_slug: string;
      org_name: string;
      role: "owner" | "admin" | "dietitian" | "assistant" | "patient";
    }
  | null = null;

  if (orgSlug) {
    activeOrganization = await findMembershipByUserIdAndOrgSlug(env, {
      userId: user.id,
      orgSlug,
    });

    if (!activeOrganization) {
      throw new AuthServiceError(
        "ORG_NOT_FOUND_FOR_USER",
        "The selected organization was not found for this user",
        404
      );
    }
  } else if (organizations.length === 1) {
    activeOrganization = organizations[0];
  } else {
    throw new AuthServiceError(
      "ORG_SELECTION_REQUIRED",
      "This user belongs to multiple organizations. Please provide orgSlug.",
      409
    );
  }

  if (!activeOrganization) {
    throw new AuthServiceError(
      "INTERNAL_AUTH_STATE_ERROR",
      "Active organization could not be resolved",
      500
    );
  }

  const accessToken = await createAccessToken(env, {
    userId: user.id,
    email: user.email,
    orgId: activeOrganization.org_id,
    role: activeOrganization.role,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    activeOrg: {
      id: activeOrganization.org_id,
      slug: activeOrganization.org_slug,
      name: activeOrganization.org_name,
    },
    membership: {
      role: activeOrganization.role,
    },
    organizations: organizations.map((organization) => ({
      id: organization.org_id,
      slug: organization.org_slug,
      name: organization.org_name,
      role: organization.role,
    })),
  };
}
