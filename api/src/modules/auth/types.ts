/**
 * Purpose: DTOs and shared auth types for register and login flows.
 * Direct dependencies: none.
 * Inputs/Outputs: raw request payloads are validated against these shapes by the auth service/controller.
 * Security: Contains credential-related request contracts and role definitions.
 * Notes: Keep these types small and explicit to avoid ambiguous auth payloads.
 */

export type AppRole = "owner" | "admin" | "dietitian" | "assistant" | "patient";

export type RegisterBody = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  orgName: string;
  orgSlug: string;
};

export type LoginBody = {
  email: string;
  password: string;
  orgSlug?: string;
};

export type AuthUserDto = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type AuthOrganizationDto = {
  id: string;
  slug: string;
  name: string;
};

export type AuthMembershipDto = {
  role: AppRole;
};

export type AuthOrganizationListItemDto = {
  id: string;
  slug: string;
  name: string;
  role: AppRole;
};

export type RegisterSuccessResponse = {
  user: AuthUserDto;
  org: AuthOrganizationDto;
  membership: AuthMembershipDto;
  accessToken: string;
};

export type LoginSuccessResponse = {
  accessToken: string;
  user: AuthUserDto;
  activeOrg: AuthOrganizationDto;
  membership: AuthMembershipDto;
  organizations: AuthOrganizationListItemDto[];
};
