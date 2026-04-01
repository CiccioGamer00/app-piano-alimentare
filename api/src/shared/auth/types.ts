/**
 * Purpose: DTOs and validation for auth endpoints.
 * Direct dependencies: none.
 * Inputs/Outputs: raw request body -> typed auth DTOs.
 * Security: Handles credentials and tenant selection.
 * Notes: Keep validation explicit to avoid weak account creation.
 */

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

export type AppRole = "owner" | "admin" | "dietitian" | "assistant" | "patient";
