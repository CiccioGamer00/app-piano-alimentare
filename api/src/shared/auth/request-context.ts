/**
 * Purpose: Shared authenticated request context type used across protected modules.
 * Direct dependencies: auth role type.
 * Inputs/Outputs: typed auth context shape for controllers and services.
 * Security: Contains identity and tenant scope extracted from a validated token.
 * Notes: This keeps protected modules consistent when passing auth data around.
 */

import type { AppRole } from "../../modules/auth/types";

export type RequestAuthContext = {
  userId: string;
  email: string;
  orgId: string;
  role: AppRole;
};
