/**
 * Purpose: Frontend API client for authentication and meal plan template read/write endpoints.
 * Direct dependencies: browser fetch API and Vite environment variables.
 * Inputs/Outputs: plain frontend params in -> parsed JSON API payloads out.
 * Security: Sends bearer tokens only to the configured API base URL; never stores secrets here.
 * Notes: This version covers login, template list, template create and full template detail reads.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://api.stemoro84.workers.dev";

/**
 * Preconditions: email and password must be non-empty strings.
 * Side effects: performs one network request to the auth login endpoint.
 * Expected errors: throws Error when the HTTP response is not ok or when fetch fails.
 */
export async function loginWithPassword({ email, password }) {
  const response = await fetch(`${API_BASE}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore login");
  }

  return data;
}

/**
 * Preconditions: accessToken must be a valid bearer token string.
 * Side effects: performs one network request to the meal plan templates list endpoint.
 * Expected errors: throws Error when the HTTP response is not ok or when fetch fails.
 */
export async function fetchMealPlanTemplates(accessToken) {
  const response = await fetch(`${API_BASE}/v1/meal-plan-templates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore caricamento template");
  }

  return data.items || [];
}

/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - name must be a non-empty string after trim.
 * Side effects: performs one network request to the meal plan templates create endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function createMealPlanTemplate(accessToken, { name, description, notes }) {
  const normalizedName = String(name || "").trim();
  const normalizedDescription = String(description || "").trim();
  const normalizedNotes = String(notes || "").trim();

  if (!normalizedName) {
    throw new Error("Il nome del template è obbligatorio");
  }

  const response = await fetch(`${API_BASE}/v1/meal-plan-templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: normalizedName,
      description: normalizedDescription || null,
      notes: normalizedNotes || null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore creazione template");
  }

  return data;
}

/**
 * Preconditions: accessToken must be valid and templateId must be a non-empty string.
 * Side effects: performs one network request to the full template detail endpoint.
 * Expected errors: throws Error when the HTTP response is not ok or when fetch fails.
 */
export async function fetchMealPlanTemplateFull(accessToken, templateId) {
  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${templateId}/full`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore caricamento dettaglio template");
  }

  return data;
}

export { API_BASE };