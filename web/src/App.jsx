/**
 * Purpose: Main frontend container for authentication and technical meal plan template exploration flows.
 * Direct dependencies: React state, CSS, auth form component, templates list component, template detail component, API client.
 * Inputs/Outputs: receives user input events -> performs auth/template API calls -> renders session, list, create form, metadata edit form, day creation form, meal creation form, item creation form, item edit form and detail states.
 * Security: Handles access token in local component state only; sends it to protected backend endpoints through the API client.
 * Notes: This prototype intentionally keeps auth, list, selection, create, update and delete state centralized here to make the flow easy to verify step by step.
 */

import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm.jsx";
import TemplateDetail from "./components/TemplateDetail.jsx";
import TemplatesList from "./components/TemplatesList.jsx";
import {
  API_BASE,
  createMealPlanTemplate,
  createMealPlanTemplateDay,
  createMealPlanTemplateItem,
  createMealPlanTemplateMeal,
  deleteMealPlanTemplate,
  fetchMealPlanTemplateFull,
  fetchMealPlanTemplates,
  loginWithPassword,
  updateMealPlanTemplate,
  updateMealPlanTemplateItem,
} from "./services/api.js";

export default function App() {
  const [email, setEmail] = useState("owner.test2@example.com");
  const [password, setPassword] = useState("Password123!");
  const [accessToken, setAccessToken] = useState("");
  const [status, setStatus] = useState("Non autenticato");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState(null);
  const [showToken, setShowToken] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [newTemplateNotes, setNewTemplateNotes] = useState("");

  const [editTemplateName, setEditTemplateName] = useState("");
  const [editTemplateDescription, setEditTemplateDescription] = useState("");
  const [editTemplateNotes, setEditTemplateNotes] = useState("");

  const [newDayLabel, setNewDayLabel] = useState("");
  const [newDaySortOrder, setNewDaySortOrder] = useState("0");

  const [newMealDayId, setNewMealDayId] = useState("");
  const [newMealLabel, setNewMealLabel] = useState("");
  const [newMealSortOrder, setNewMealSortOrder] = useState("0");

  const [newItemDayId, setNewItemDayId] = useState("");
  const [newItemMealId, setNewItemMealId] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [newItemQuantityText, setNewItemQuantityText] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");
  const [newItemSortOrder, setNewItemSortOrder] = useState("0");

  const [editItemDayId, setEditItemDayId] = useState("");
  const [editItemMealId, setEditItemMealId] = useState("");
  const [editItemId, setEditItemId] = useState("");
  const [editItemText, setEditItemText] = useState("");
  const [editItemQuantityText, setEditItemQuantityText] = useState("");
  const [editItemNotes, setEditItemNotes] = useState("");
  const [editItemSortOrder, setEditItemSortOrder] = useState("0");

  function getDayById(detail, dayId) {
    if (!detail || !Array.isArray(detail.days)) {
      return null;
    }

    return detail.days.find((day) => day.id === dayId) || null;
  }

  function getMealById(detail, dayId, mealId) {
    const day = getDayById(detail, dayId);

    if (!day || !Array.isArray(day.meals)) {
      return null;
    }

    return day.meals.find((meal) => meal.id === mealId) || null;
  }

  function getItemById(detail, dayId, mealId, itemId) {
    const meal = getMealById(detail, dayId, mealId);

    if (!meal || !Array.isArray(meal.items)) {
      return null;
    }

    return meal.items.find((item) => item.id === itemId) || null;
  }

  function resetItemForm() {
    setNewItemDayId("");
    setNewItemMealId("");
    setNewItemText("");
    setNewItemQuantityText("");
    setNewItemNotes("");
    setNewItemSortOrder("0");
  }

  function resetEditItemForm() {
    setEditItemDayId("");
    setEditItemMealId("");
    setEditItemId("");
    setEditItemText("");
    setEditItemQuantityText("");
    setEditItemNotes("");
    setEditItemSortOrder("0");
  }

  function syncItemFormFromDetail(detail) {
    const firstDayWithMeals =
      detail?.days?.find((day) => Array.isArray(day.meals) && day.meals.length > 0) ||
      null;

    if (!firstDayWithMeals) {
      resetItemForm();
      return;
    }

    const firstMeal = firstDayWithMeals.meals[0];

    setNewItemDayId(firstDayWithMeals.id);
    setNewItemMealId(firstMeal.id);
    setNewItemText("");
    setNewItemQuantityText("");
    setNewItemNotes("");
    setNewItemSortOrder(String(firstMeal.items.length));
  }

  function syncEditItemFormFromDetail(detail) {
    const firstDay = detail?.days?.[0] || null;
    const firstMeal = firstDay?.meals?.[0] || null;

    let firstItem = null;
    let firstItemDayId = "";
    let firstItemMealId = "";

    for (const day of detail?.days || []) {
      for (const meal of day.meals || []) {
        if (Array.isArray(meal.items) && meal.items.length > 0) {
          firstItem = meal.items[0];
          firstItemDayId = day.id;
          firstItemMealId = meal.id;
          break;
        }
      }

      if (firstItem) {
        break;
      }
    }

    if (!firstItem) {
      setEditItemDayId(firstDay?.id || "");
      setEditItemMealId(firstMeal?.id || "");
      setEditItemId("");
      setEditItemText("");
      setEditItemQuantityText("");
      setEditItemNotes("");
      setEditItemSortOrder("0");
      return;
    }

    setEditItemDayId(firstItemDayId);
    setEditItemMealId(firstItemMealId);
    setEditItemId(firstItem.id);
    setEditItemText(firstItem.itemText || "");
    setEditItemQuantityText(firstItem.quantityText || "");
    setEditItemNotes(firstItem.notes || "");
    setEditItemSortOrder(String(firstItem.sortOrder ?? 0));
  }

  function handleNewMealDayIdChange(dayId) {
    setNewMealDayId(dayId);

    const selectedDay = getDayById(selectedTemplateDetail, dayId);
    setNewMealSortOrder(String(selectedDay?.meals.length || 0));
  }

  function handleNewItemDayIdChange(dayId) {
    setNewItemDayId(dayId);

    const selectedDay = getDayById(selectedTemplateDetail, dayId);
    const firstMeal = selectedDay?.meals[0] || null;

    setNewItemMealId(firstMeal?.id || "");
    setNewItemSortOrder(String(firstMeal?.items.length || 0));
  }

  function handleNewItemMealIdChange(mealId) {
    setNewItemMealId(mealId);

    const selectedMeal = getMealById(selectedTemplateDetail, newItemDayId, mealId);
    setNewItemSortOrder(String(selectedMeal?.items.length || 0));
  }

  function handleEditItemDayIdChange(dayId) {
    setEditItemDayId(dayId);

    const selectedDay = getDayById(selectedTemplateDetail, dayId);
    const firstMeal = selectedDay?.meals[0] || null;
    const firstItem = firstMeal?.items[0] || null;

    setEditItemMealId(firstMeal?.id || "");
    setEditItemId(firstItem?.id || "");
    setEditItemText(firstItem?.itemText || "");
    setEditItemQuantityText(firstItem?.quantityText || "");
    setEditItemNotes(firstItem?.notes || "");
    setEditItemSortOrder(String(firstItem?.sortOrder ?? 0));
  }

  function handleEditItemMealIdChange(mealId) {
    setEditItemMealId(mealId);

    const selectedMeal = getMealById(selectedTemplateDetail, editItemDayId, mealId);
    const firstItem = selectedMeal?.items[0] || null;

    setEditItemId(firstItem?.id || "");
    setEditItemText(firstItem?.itemText || "");
    setEditItemQuantityText(firstItem?.quantityText || "");
    setEditItemNotes(firstItem?.notes || "");
    setEditItemSortOrder(String(firstItem?.sortOrder ?? 0));
  }

  function handleEditItemIdChange(itemId) {
    setEditItemId(itemId);

    const selectedItem = getItemById(
      selectedTemplateDetail,
      editItemDayId,
      editItemMealId,
      itemId
    );

    setEditItemText(selectedItem?.itemText || "");
    setEditItemQuantityText(selectedItem?.quantityText || "");
    setEditItemNotes(selectedItem?.notes || "");
    setEditItemSortOrder(String(selectedItem?.sortOrder ?? 0));
  }

  /**
   * Preconditions: the form submit event must come from the login form.
   * Side effects: performs an auth API call and writes session token/status into component state.
   * Expected errors: invalid credentials, network errors, non-ok API responses.
   */
  async function handleLogin(event) {
    event.preventDefault();
    setStatus("Login in corso...");

    try {
      const data = await loginWithPassword({ email, password });
      setAccessToken(data.accessToken);
      setStatus("Login riuscito");
    } catch (error) {
      setStatus(`Errore login: ${String(error)}`);
    }
  }

  /**
   * Preconditions: accessToken must be available.
   * Side effects: performs one protected API call and refreshes templates/select-detail state.
   * Expected errors: missing auth token, network errors, non-ok API responses.
   */
  async function handleLoadTemplates() {
    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    setStatus("Caricamento template...");

    try {
      const items = await fetchMealPlanTemplates(accessToken);
      setTemplates(items);
      setSelectedTemplateDetail(null);
      setSelectedTemplateId("");
      setEditTemplateName("");
      setEditTemplateDescription("");
      setEditTemplateNotes("");
      setNewDayLabel("");
      setNewDaySortOrder("0");
      setNewMealDayId("");
      setNewMealLabel("");
      setNewMealSortOrder("0");
      resetItemForm();
      resetEditItemForm();
      setStatus("Template caricati");
    } catch (error) {
      setStatus(`Errore caricamento template: ${String(error)}`);
    }
  }

  /**
   * Preconditions: accessToken must be available and templateId must be a non-empty string.
   * Side effects: performs one protected API call and updates selected template state.
   * Expected errors: missing auth token, network errors, non-ok API responses.
   */
  async function handleSelectTemplate(templateId) {
    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    setSelectedTemplateId(templateId);
    setStatus("Caricamento dettaglio template...");

    try {
      const detail = await fetchMealPlanTemplateFull(accessToken, templateId);
      setSelectedTemplateDetail(detail);
      setEditTemplateName(detail.name || "");
      setEditTemplateDescription(detail.description || "");
      setEditTemplateNotes(detail.notes || "");
      setNewDayLabel("");
      setNewDaySortOrder(
        String(Array.isArray(detail.days) ? detail.days.length : 0)
      );

      const firstDayId = detail.days[0]?.id || "";
      const firstDayMealsCount = detail.days[0]?.meals?.length || 0;
      setNewMealDayId(firstDayId);
      setNewMealLabel("");
      setNewMealSortOrder(String(firstDayMealsCount));

      syncItemFormFromDetail(detail);
      syncEditItemFormFromDetail(detail);

      setStatus("Dettaglio template caricato");
    } catch (error) {
      setStatus(`Errore caricamento dettaglio: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - newTemplateName must contain a non-empty value after trim.
   * Side effects:
   * - performs create + list refresh + detail read API calls
   * - clears the create form on success
   * - updates template list and selected detail state
   * Expected errors: missing auth token, local validation errors, network errors, non-ok API responses.
   */
  async function handleCreateTemplate(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    setStatus("Creazione template in corso...");

    try {
      const createdTemplate = await createMealPlanTemplate(accessToken, {
        name: newTemplateName,
        description: newTemplateDescription,
        notes: newTemplateNotes,
      });

      const items = await fetchMealPlanTemplates(accessToken);
      setTemplates(items);

      setSelectedTemplateId(createdTemplate.id);

      const detail = await fetchMealPlanTemplateFull(accessToken, createdTemplate.id);
      setSelectedTemplateDetail(detail);
      setEditTemplateName(detail.name || "");
      setEditTemplateDescription(detail.description || "");
      setEditTemplateNotes(detail.notes || "");
      setNewDayLabel("");
      setNewDaySortOrder("0");
      setNewMealDayId("");
      setNewMealLabel("");
      setNewMealSortOrder("0");
      resetItemForm();
      resetEditItemForm();

      setNewTemplateName("");
      setNewTemplateDescription("");
      setNewTemplateNotes("");
      setStatus("Template creato e caricato");
    } catch (error) {
      setStatus(`Errore creazione template: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - selectedTemplateId must identify an existing template in the current org.
   * Side effects:
   * - performs update + list refresh + detail read API calls
   * - rewrites edit state with the canonical backend response
   * Expected errors: missing auth token, no selected template, local validation errors, network errors, non-ok API responses.
   */
  async function handleUpdateTemplate(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    setStatus("Aggiornamento template in corso...");

    try {
      await updateMealPlanTemplate(accessToken, selectedTemplateId, {
        name: editTemplateName,
        description: editTemplateDescription,
        notes: editTemplateNotes,
      });

      const items = await fetchMealPlanTemplates(accessToken);
      setTemplates(items);

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);
      setEditTemplateName(detail.name || "");
      setEditTemplateDescription(detail.description || "");
      setEditTemplateNotes(detail.notes || "");
      setStatus("Template aggiornato");
    } catch (error) {
      setStatus(`Errore aggiornamento template: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - selectedTemplateId must identify an existing template in the current org.
   * - newDayLabel must be non-empty and newDaySortOrder must be a valid integer >= 0.
   * Side effects:
   * - performs day create + detail read API calls
   * - clears the day creation form on success
   * - refreshes the selected template detail with the new nested day
   * Expected errors: missing auth token, no selected template, local validation errors, network errors, non-ok API responses.
   */
  async function handleCreateDay(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    setStatus("Creazione giorno in corso...");

    try {
      const createdDay = await createMealPlanTemplateDay(accessToken, selectedTemplateId, {
        dayLabel: newDayLabel,
        sortOrder: newDaySortOrder,
      });

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);
      setNewDayLabel("");
      setNewDaySortOrder(String(detail.days.length));
      setNewMealDayId(createdDay.id);
      setNewMealSortOrder("0");

      const createdDayFromDetail = getDayById(detail, createdDay.id);
      setNewItemDayId(createdDay.id);
      setNewItemMealId("");
      setNewItemText("");
      setNewItemQuantityText("");
      setNewItemNotes("");
      setNewItemSortOrder(
        String(createdDayFromDetail?.meals[0]?.items.length || 0)
      );

      syncEditItemFormFromDetail(detail);

      setStatus("Giorno creato e caricato");
    } catch (error) {
      setStatus(`Errore creazione giorno: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - selectedTemplateId and newMealDayId must identify existing resources in the current org.
   * - newMealLabel must be non-empty and newMealSortOrder must be a valid integer >= 0.
   * Side effects:
   * - performs meal create + detail read API calls
   * - clears the meal creation form on success
   * - refreshes the selected template detail with the new nested meal
   * Expected errors: missing auth token, missing selected template/day, local validation errors, network errors, non-ok API responses.
   */
  async function handleCreateMeal(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    if (!newMealDayId) {
      setStatus("Seleziona prima un giorno");
      return;
    }

    setStatus("Creazione pasto in corso...");

    try {
      const createdMeal = await createMealPlanTemplateMeal(
        accessToken,
        selectedTemplateId,
        newMealDayId,
        {
          mealLabel: newMealLabel,
          sortOrder: newMealSortOrder,
        }
      );

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);

      const selectedDay = getDayById(detail, newMealDayId);
      setNewMealLabel("");
      setNewMealSortOrder(String(selectedDay?.meals.length || 0));

      setNewItemDayId(newMealDayId);
      setNewItemMealId(createdMeal.id);
      setNewItemText("");
      setNewItemQuantityText("");
      setNewItemNotes("");
      setNewItemSortOrder("0");

      syncEditItemFormFromDetail(detail);

      setStatus("Pasto creato e caricato");
    } catch (error) {
      setStatus(`Errore creazione pasto: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - selectedTemplateId, newItemDayId and newItemMealId must identify existing resources in the current org.
   * - newItemText must be non-empty and newItemSortOrder must be a valid integer >= 0.
   * Side effects:
   * - performs item create + detail read API calls
   * - clears the item text fields on success
   * - refreshes the selected template detail with the new nested item
   * Expected errors: missing auth token, missing selected template/day/meal, local validation errors, network errors, non-ok API responses.
   */
  async function handleCreateItem(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    if (!newItemDayId) {
      setStatus("Seleziona prima un giorno");
      return;
    }

    if (!newItemMealId) {
      setStatus("Seleziona prima un pasto");
      return;
    }

    setStatus("Creazione item in corso...");

    try {
      const createdItem = await createMealPlanTemplateItem(
        accessToken,
        selectedTemplateId,
        newItemDayId,
        newItemMealId,
        {
          itemText: newItemText,
          quantityText: newItemQuantityText,
          notes: newItemNotes,
          sortOrder: newItemSortOrder,
        }
      );

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);

      const selectedMeal = getMealById(detail, newItemDayId, newItemMealId);
      setNewItemText("");
      setNewItemQuantityText("");
      setNewItemNotes("");
      setNewItemSortOrder(String(selectedMeal?.items.length || 0));

      const createdItemFromDetail = getItemById(
        detail,
        newItemDayId,
        newItemMealId,
        createdItem.id
      );

      setEditItemDayId(newItemDayId);
      setEditItemMealId(newItemMealId);
      setEditItemId(createdItem.id);
      setEditItemText(createdItemFromDetail?.itemText || "");
      setEditItemQuantityText(createdItemFromDetail?.quantityText || "");
      setEditItemNotes(createdItemFromDetail?.notes || "");
      setEditItemSortOrder(String(createdItemFromDetail?.sortOrder ?? 0));

      setStatus("Item creato e caricato");
    } catch (error) {
      setStatus(`Errore creazione item: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - selectedTemplateId, editItemDayId, editItemMealId and editItemId must identify existing resources in the current org.
   * Side effects:
   * - performs item update + detail read API calls
   * - rewrites edit item form with the canonical backend response
   * Expected errors: missing auth token, missing selected template/day/meal/item, local validation errors, network errors, non-ok API responses.
   */
  async function handleUpdateItem(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    if (!editItemDayId) {
      setStatus("Seleziona prima un giorno dell'item");
      return;
    }

    if (!editItemMealId) {
      setStatus("Seleziona prima un pasto dell'item");
      return;
    }

    if (!editItemId) {
      setStatus("Seleziona prima un item");
      return;
    }

    setStatus("Aggiornamento item in corso...");

    try {
      await updateMealPlanTemplateItem(
        accessToken,
        selectedTemplateId,
        editItemDayId,
        editItemMealId,
        editItemId,
        {
          itemText: editItemText,
          quantityText: editItemQuantityText,
          notes: editItemNotes,
          sortOrder: editItemSortOrder,
        }
      );

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);

      const updatedItem = getItemById(
        detail,
        editItemDayId,
        editItemMealId,
        editItemId
      );

      if (!updatedItem) {
        syncEditItemFormFromDetail(detail);
      } else {
        setEditItemText(updatedItem.itemText || "");
        setEditItemQuantityText(updatedItem.quantityText || "");
        setEditItemNotes(updatedItem.notes || "");
        setEditItemSortOrder(String(updatedItem.sortOrder ?? 0));
      }

      setStatus("Item aggiornato");
    } catch (error) {
      setStatus(`Errore aggiornamento item: ${String(error)}`);
    }
  }

  /**
   * Preconditions:
   * - accessToken must be available.
   * - templateId must be a non-empty string.
   * Side effects:
   * - performs delete + list refresh API calls
   * - clears selected detail state when the deleted template was currently open
   * Expected errors: missing auth token, local validation errors, network errors, non-ok API responses.
   */
  async function handleDeleteTemplate(templateId) {
    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    const shouldDelete = window.confirm(
      "Confermi l'eliminazione del template selezionato?"
    );

    if (!shouldDelete) {
      return;
    }

    setStatus("Eliminazione template in corso...");

    try {
      await deleteMealPlanTemplate(accessToken, templateId);

      const items = await fetchMealPlanTemplates(accessToken);
      setTemplates(items);

      if (selectedTemplateId === templateId) {
        setSelectedTemplateId("");
        setSelectedTemplateDetail(null);
        setEditTemplateName("");
        setEditTemplateDescription("");
        setEditTemplateNotes("");
        setNewDayLabel("");
        setNewDaySortOrder("0");
        setNewMealDayId("");
        setNewMealLabel("");
        setNewMealSortOrder("0");
        resetItemForm();
        resetEditItemForm();
      }

      setStatus("Template eliminato");
    } catch (error) {
      setStatus(`Errore eliminazione template: ${String(error)}`);
    }
  }

  const isAuthenticated = accessToken.length > 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Piano alimentare</p>
          <h1 className="app-title">Esplora template</h1>
          <p className="app-subtitle">
            Area tecnica di lettura per verificare login, lista template,
            creazione metadata, aggiornamento, eliminazione, creazione giorni,
            creazione pasti, creazione item, modifica item e dettaglio completo
            del template.
          </p>
        </div>

        <div className="header-meta">
          <p>
            <strong>API:</strong> {API_BASE}
          </p>
          <p>
            <strong>Stato:</strong> {status}
          </p>
          <p>
            <strong>Template attivo:</strong> {selectedTemplateId || "nessuno"}
          </p>
        </div>
      </header>

      <section className="top-grid">
        <LoginForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />

        <section className="panel">
          <h2 className="panel-title">Sessione</h2>
          <p className="session-badge">
            {isAuthenticated ? "Autenticato" : "Non autenticato"}
          </p>
          <p className="muted-text">
            Usa il login per ottenere un token e interrogare gli endpoint
            protetti del backend.
          </p>

          <div className="session-actions">
            <button
              className="secondary-button"
              onClick={() => setShowToken((current) => !current)}
              type="button"
              disabled={!isAuthenticated}
            >
              {showToken ? "Nascondi token" : "Mostra token"}
            </button>
          </div>
        </section>
      </section>

      <section className="panel">
        <h2 className="panel-title">Crea template</h2>
        <p className="muted-text">
          Primo step frontend: creazione del solo metadata del template.
        </p>

        <form onSubmit={handleCreateTemplate}>
          <div className="field">
            <label className="field-label" htmlFor="new-template-name">
              Nome template
            </label>
            <input
              className="field-input"
              id="new-template-name"
              type="text"
              value={newTemplateName}
              onChange={(event) => setNewTemplateName(event.target.value)}
              disabled={!isAuthenticated}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="new-template-description">
              Descrizione
            </label>
            <textarea
              className="field-input"
              id="new-template-description"
              rows={3}
              value={newTemplateDescription}
              onChange={(event) => setNewTemplateDescription(event.target.value)}
              disabled={!isAuthenticated}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="new-template-notes">
              Note
            </label>
            <textarea
              className="field-input"
              id="new-template-notes"
              rows={3}
              value={newTemplateNotes}
              onChange={(event) => setNewTemplateNotes(event.target.value)}
              disabled={!isAuthenticated}
            />
          </div>

          <div className="session-actions">
            <button
              className="primary-button"
              type="submit"
              disabled={!isAuthenticated}
            >
              Crea template
            </button>
          </div>
        </form>
      </section>

      <section className="content-grid">
        <TemplatesList
          templates={templates}
          isAuthenticated={isAuthenticated}
          selectedTemplateId={selectedTemplateId}
          onLoadTemplates={handleLoadTemplates}
          onSelectTemplate={handleSelectTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />

        <TemplateDetail
          template={selectedTemplateDetail}
          isAuthenticated={isAuthenticated}
          editName={editTemplateName}
          editDescription={editTemplateDescription}
          editNotes={editTemplateNotes}
          onEditNameChange={setEditTemplateName}
          onEditDescriptionChange={setEditTemplateDescription}
          onEditNotesChange={setEditTemplateNotes}
          onSubmitEdit={handleUpdateTemplate}
          newDayLabel={newDayLabel}
          newDaySortOrder={newDaySortOrder}
          onNewDayLabelChange={setNewDayLabel}
          onNewDaySortOrderChange={setNewDaySortOrder}
          onSubmitCreateDay={handleCreateDay}
          newMealDayId={newMealDayId}
          newMealLabel={newMealLabel}
          newMealSortOrder={newMealSortOrder}
          onNewMealDayIdChange={handleNewMealDayIdChange}
          onNewMealLabelChange={setNewMealLabel}
          onNewMealSortOrderChange={setNewMealSortOrder}
          onSubmitCreateMeal={handleCreateMeal}
          newItemDayId={newItemDayId}
          newItemMealId={newItemMealId}
          newItemText={newItemText}
          newItemQuantityText={newItemQuantityText}
          newItemNotes={newItemNotes}
          newItemSortOrder={newItemSortOrder}
          onNewItemDayIdChange={handleNewItemDayIdChange}
          onNewItemMealIdChange={handleNewItemMealIdChange}
          onNewItemTextChange={setNewItemText}
          onNewItemQuantityTextChange={setNewItemQuantityText}
          onNewItemNotesChange={setNewItemNotes}
          onNewItemSortOrderChange={setNewItemSortOrder}
          onSubmitCreateItem={handleCreateItem}
          editItemDayId={editItemDayId}
          editItemMealId={editItemMealId}
          editItemId={editItemId}
          editItemText={editItemText}
          editItemQuantityText={editItemQuantityText}
          editItemNotes={editItemNotes}
          editItemSortOrder={editItemSortOrder}
          onEditItemDayIdChange={handleEditItemDayIdChange}
          onEditItemMealIdChange={handleEditItemMealIdChange}
          onEditItemIdChange={handleEditItemIdChange}
          onEditItemTextChange={setEditItemText}
          onEditItemQuantityTextChange={setEditItemQuantityText}
          onEditItemNotesChange={setEditItemNotes}
          onEditItemSortOrderChange={setEditItemSortOrder}
          onSubmitEditItem={handleUpdateItem}
        />
      </section>

      {showToken ? (
        <section className="panel">
          <h2 className="panel-title">Token</h2>
          <textarea className="token-box" readOnly value={accessToken} />
        </section>
      ) : null}
    </div>
  );
}