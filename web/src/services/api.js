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
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId must be a non-empty string.
 * Side effects: performs one network request to the meal plan templates delete endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function deleteMealPlanTemplate(accessToken, templateId) {
  const normalizedTemplateId = String(templateId || "").trim();

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore eliminazione template");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId must be a non-empty string.
 * - at least one updatable field must be provided.
 * Side effects: performs one network request to the meal plan templates update endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function updateMealPlanTemplate(
  accessToken,
  templateId,
  { name, description, notes }
) {
  const normalizedTemplateId = String(templateId || "").trim();

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  const payload = {};

  if (name !== undefined) {
    const normalizedName = String(name).trim();

    if (!normalizedName) {
      throw new Error("Il nome del template non può essere vuoto");
    }

    payload.name = normalizedName;
  }

  if (description !== undefined) {
    const normalizedDescription = String(description || "").trim();
    payload.description = normalizedDescription || null;
  }

  if (notes !== undefined) {
    const normalizedNotes = String(notes || "").trim();
    payload.notes = normalizedNotes || null;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Devi modificare almeno un campo");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore aggiornamento template");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId must be a non-empty string.
 * - dayLabel must be a non-empty string after trim.
 * - sortOrder must be an integer greater than or equal to 0.
 * Side effects: performs one network request to the meal plan template days create endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function createMealPlanTemplateDay(
  accessToken,
  templateId,
  { dayLabel, sortOrder }
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayLabel = String(dayLabel || "").trim();
  const normalizedSortOrder = Number(sortOrder);

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayLabel) {
    throw new Error("Il nome del giorno è obbligatorio");
  }

  if (
    !Number.isInteger(normalizedSortOrder) ||
    normalizedSortOrder < 0
  ) {
    throw new Error("L'ordine del giorno deve essere un intero maggiore o uguale a 0");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        dayLabel: normalizedDayLabel,
        sortOrder: normalizedSortOrder,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore creazione giorno");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId and dayId must be non-empty strings.
 * - mealLabel must be a non-empty string after trim.
 * - sortOrder must be an integer greater than or equal to 0.
 * Side effects: performs one network request to the meal plan template meals create endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function createMealPlanTemplateMeal(
  accessToken,
  templateId,
  dayId,
  { mealLabel, sortOrder }
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayId = String(dayId || "").trim();
  const normalizedMealLabel = String(mealLabel || "").trim();
  const normalizedSortOrder = Number(sortOrder);

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayId) {
    throw new Error("L'id del giorno è obbligatorio");
  }

  if (!normalizedMealLabel) {
    throw new Error("Il nome del pasto è obbligatorio");
  }

  if (!Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0) {
    throw new Error("L'ordine del pasto deve essere un intero maggiore o uguale a 0");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days/${normalizedDayId}/meals`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        mealLabel: normalizedMealLabel,
        sortOrder: normalizedSortOrder,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore creazione pasto");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId, dayId and mealId must be non-empty strings.
 * - at least one updatable field must be provided.
 * Side effects: performs one network request to the meal plan template meal update endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function updateMealPlanTemplateMeal(
  accessToken,
  templateId,
  dayId,
  mealId,
  { mealLabel, sortOrder }
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayId = String(dayId || "").trim();
  const normalizedMealId = String(mealId || "").trim();

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayId) {
    throw new Error("L'id del giorno è obbligatorio");
  }

  if (!normalizedMealId) {
    throw new Error("L'id del pasto è obbligatorio");
  }

  const payload = {};

  if (mealLabel !== undefined) {
    const normalizedMealLabel = String(mealLabel || "").trim();

    if (!normalizedMealLabel) {
      throw new Error("Il nome del pasto non può essere vuoto");
    }

    payload.mealLabel = normalizedMealLabel;
  }

  if (sortOrder !== undefined) {
    const normalizedSortOrder = Number(sortOrder);

    if (!Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0) {
      throw new Error("L'ordine del pasto deve essere un intero maggiore o uguale a 0");
    }

    payload.sortOrder = normalizedSortOrder;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Devi modificare almeno un campo del pasto");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days/${normalizedDayId}/meals/${normalizedMealId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore aggiornamento pasto");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId, dayId and mealId must be non-empty strings.
 * Side effects: performs one network request to the meal plan template meal delete endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function deleteMealPlanTemplateMeal(
  accessToken,
  templateId,
  dayId,
  mealId
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayId = String(dayId || "").trim();
  const normalizedMealId = String(mealId || "").trim();

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayId) {
    throw new Error("L'id del giorno è obbligatorio");
  }

  if (!normalizedMealId) {
    throw new Error("L'id del pasto è obbligatorio");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days/${normalizedDayId}/meals/${normalizedMealId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore eliminazione pasto");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId, dayId and mealId must be non-empty strings.
 * - itemText must be a non-empty string after trim.
 * - sortOrder must be an integer greater than or equal to 0.
 * Side effects: performs one network request to the meal plan template items create endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function createMealPlanTemplateItem(
  accessToken,
  templateId,
  dayId,
  mealId,
  { itemText, quantityText, notes, sortOrder }
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayId = String(dayId || "").trim();
  const normalizedMealId = String(mealId || "").trim();
  const normalizedItemText = String(itemText || "").trim();
  const normalizedQuantityText = String(quantityText || "").trim();
  const normalizedNotes = String(notes || "").trim();
  const normalizedSortOrder = Number(sortOrder);

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayId) {
    throw new Error("L'id del giorno è obbligatorio");
  }

  if (!normalizedMealId) {
    throw new Error("L'id del pasto è obbligatorio");
  }

  if (!normalizedItemText) {
    throw new Error("Il testo dell'item è obbligatorio");
  }

  if (!Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0) {
    throw new Error("L'ordine dell'item deve essere un intero maggiore o uguale a 0");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days/${normalizedDayId}/meals/${normalizedMealId}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        itemText: normalizedItemText,
        quantityText: normalizedQuantityText || null,
        notes: normalizedNotes || null,
        sortOrder: normalizedSortOrder,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore creazione item");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId, dayId, mealId and itemId must be non-empty strings.
 * - at least one updatable field must be provided.
 * Side effects: performs one network request to the meal plan template item update endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function updateMealPlanTemplateItem(
  accessToken,
  templateId,
  dayId,
  mealId,
  itemId,
  { itemText, quantityText, notes, sortOrder }
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayId = String(dayId || "").trim();
  const normalizedMealId = String(mealId || "").trim();
  const normalizedItemId = String(itemId || "").trim();

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayId) {
    throw new Error("L'id del giorno è obbligatorio");
  }

  if (!normalizedMealId) {
    throw new Error("L'id del pasto è obbligatorio");
  }

  if (!normalizedItemId) {
    throw new Error("L'id dell'item è obbligatorio");
  }

  const payload = {};

  if (itemText !== undefined) {
    const normalizedItemText = String(itemText || "").trim();

    if (!normalizedItemText) {
      throw new Error("Il testo dell'item non può essere vuoto");
    }

    payload.itemText = normalizedItemText;
  }

  if (quantityText !== undefined) {
    const normalizedQuantityText = String(quantityText || "").trim();
    payload.quantityText = normalizedQuantityText || null;
  }

  if (notes !== undefined) {
    const normalizedNotes = String(notes || "").trim();
    payload.notes = normalizedNotes || null;
  }

  if (sortOrder !== undefined) {
    const normalizedSortOrder = Number(sortOrder);

    if (!Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0) {
      throw new Error("L'ordine dell'item deve essere un intero maggiore o uguale a 0");
    }

    payload.sortOrder = normalizedSortOrder;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Devi modificare almeno un campo dell'item");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days/${normalizedDayId}/meals/${normalizedMealId}/items/${normalizedItemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore aggiornamento item");
  }

  return data;
}
/**
 * Preconditions:
 * - accessToken must be a valid bearer token string.
 * - templateId, dayId, mealId and itemId must be non-empty strings.
 * Side effects: performs one network request to the meal plan template item delete endpoint.
 * Expected errors: throws Error when validation fails locally, when the HTTP response is not ok or when fetch fails.
 */
export async function deleteMealPlanTemplateItem(
  accessToken,
  templateId,
  dayId,
  mealId,
  itemId
) {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedDayId = String(dayId || "").trim();
  const normalizedMealId = String(mealId || "").trim();
  const normalizedItemId = String(itemId || "").trim();

  if (!normalizedTemplateId) {
    throw new Error("L'id del template è obbligatorio");
  }

  if (!normalizedDayId) {
    throw new Error("L'id del giorno è obbligatorio");
  }

  if (!normalizedMealId) {
    throw new Error("L'id del pasto è obbligatorio");
  }

  if (!normalizedItemId) {
    throw new Error("L'id dell'item è obbligatorio");
  }

  const response = await fetch(
    `${API_BASE}/v1/meal-plan-templates/${normalizedTemplateId}/days/${normalizedDayId}/meals/${normalizedMealId}/items/${normalizedItemId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Errore eliminazione item");
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