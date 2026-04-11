/**
 * Purpose: Main frontend container for authentication and technical meal plan template exploration flows.
 * Direct dependencies: React state, CSS, auth form component, templates list component, template detail component, API client.
 * Inputs/Outputs: receives user input events -> performs auth/template API calls -> renders session, list, create form, metadata edit form, day creation form, meal creation form and detail states.
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
  createMealPlanTemplateMeal,
  deleteMealPlanTemplate,
  fetchMealPlanTemplateFull,
  fetchMealPlanTemplates,
  loginWithPassword,
  updateMealPlanTemplate,
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
      await createMealPlanTemplateDay(accessToken, selectedTemplateId, {
        dayLabel: newDayLabel,
        sortOrder: newDaySortOrder,
      });

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);
      setNewDayLabel("");
      setNewDaySortOrder(String(detail.days.length));

      const lastCreatedDay = detail.days[detail.days.length - 1];
      if (lastCreatedDay) {
        setNewMealDayId(lastCreatedDay.id);
        setNewMealSortOrder(String(lastCreatedDay.meals.length));
      }

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
      await createMealPlanTemplateMeal(
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

      const selectedDay = detail.days.find((day) => day.id === newMealDayId);
      setNewMealLabel("");
      setNewMealSortOrder(String(selectedDay?.meals.length || 0));

      setStatus("Pasto creato e caricato");
    } catch (error) {
      setStatus(`Errore creazione pasto: ${String(error)}`);
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
            creazione pasti e dettaglio completo del template.
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
          onNewMealDayIdChange={setNewMealDayId}
          onNewMealLabelChange={setNewMealLabel}
          onNewMealSortOrderChange={setNewMealSortOrder}
          onSubmitCreateMeal={handleCreateMeal}
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