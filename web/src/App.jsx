/**
 * Purpose: Main frontend container for authentication and technical meal plan template exploration flows.
 * Direct dependencies: React state, CSS, auth form component, templates list component, template detail component, API client.
 * Inputs/Outputs: receives user input events -> performs auth/template API calls -> renders session, list, create form, metadata edit form, day creation form, meal creation form, meal edit form, item creation form, item edit form and detail states.
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
  deleteMealPlanTemplateItem,
  fetchMealPlanTemplateFull,
  fetchMealPlanTemplates,
  loginWithPassword,
  updateMealPlanTemplate,
  updateMealPlanTemplateItem,
  updateMealPlanTemplateMeal,
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

  const [editMealDayId, setEditMealDayId] = useState("");
  const [editMealId, setEditMealId] = useState("");
  const [editMealLabel, setEditMealLabel] = useState("");
  const [editMealSortOrder, setEditMealSortOrder] = useState("0");

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

  function resetEditMealForm() {
    setEditMealDayId("");
    setEditMealId("");
    setEditMealLabel("");
    setEditMealSortOrder("0");
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

  function syncEditMealFormFromDetail(detail) {
    const firstDayWithMeals =
      detail?.days?.find((day) => Array.isArray(day.meals) && day.meals.length > 0) ||
      null;

    if (!firstDayWithMeals) {
      resetEditMealForm();
      return;
    }

    const firstMeal = firstDayWithMeals.meals[0];

    setEditMealDayId(firstDayWithMeals.id);
    setEditMealId(firstMeal.id);
    setEditMealLabel(firstMeal.mealLabel || "");
    setEditMealSortOrder(String(firstMeal.sortOrder ?? 0));
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

  function handleEditMealDayIdChange(dayId) {
    setEditMealDayId(dayId);

    const selectedDay = getDayById(selectedTemplateDetail, dayId);
    const firstMeal = selectedDay?.meals?.[0] || null;

    setEditMealId(firstMeal?.id || "");
    setEditMealLabel(firstMeal?.mealLabel || "");
    setEditMealSortOrder(String(firstMeal?.sortOrder ?? 0));
  }

  function handleEditMealIdChange(mealId) {
    setEditMealId(mealId);

    const selectedMeal = getMealById(selectedTemplateDetail, editMealDayId, mealId);
    setEditMealLabel(selectedMeal?.mealLabel || "");
    setEditMealSortOrder(String(selectedMeal?.sortOrder ?? 0));
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
      resetEditMealForm();
      resetItemForm();
      resetEditItemForm();
      setStatus("Template caricati");
    } catch (error) {
      setStatus(`Errore caricamento template: ${String(error)}`);
    }
  }

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

      syncEditMealFormFromDetail(detail);
      syncItemFormFromDetail(detail);
      syncEditItemFormFromDetail(detail);

      setStatus("Dettaglio template caricato");
    } catch (error) {
      setStatus(`Errore caricamento dettaglio: ${String(error)}`);
    }
  }

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
      resetEditMealForm();
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

      syncEditMealFormFromDetail(detail);
      syncEditItemFormFromDetail(detail);

      setStatus("Giorno creato e caricato");
    } catch (error) {
      setStatus(`Errore creazione giorno: ${String(error)}`);
    }
  }

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

      setEditMealDayId(newMealDayId);
      setEditMealId(createdMeal.id);

      const createdMealFromDetail = getMealById(detail, newMealDayId, createdMeal.id);
      setEditMealLabel(createdMealFromDetail?.mealLabel || "");
      setEditMealSortOrder(String(createdMealFromDetail?.sortOrder ?? 0));

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

  async function handleUpdateMeal(event) {
    event.preventDefault();

    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    if (!editMealDayId) {
      setStatus("Seleziona prima un giorno del pasto");
      return;
    }

    if (!editMealId) {
      setStatus("Seleziona prima un pasto");
      return;
    }

    setStatus("Aggiornamento pasto in corso...");

    try {
      await updateMealPlanTemplateMeal(
        accessToken,
        selectedTemplateId,
        editMealDayId,
        editMealId,
        {
          mealLabel: editMealLabel,
          sortOrder: editMealSortOrder,
        }
      );

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);

      const updatedMeal = getMealById(detail, editMealDayId, editMealId);

      if (!updatedMeal) {
        syncEditMealFormFromDetail(detail);
      } else {
        setEditMealLabel(updatedMeal.mealLabel || "");
        setEditMealSortOrder(String(updatedMeal.sortOrder ?? 0));
      }

      setStatus("Pasto aggiornato");
    } catch (error) {
      setStatus(`Errore aggiornamento pasto: ${String(error)}`);
    }
  }

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

  async function handleDeleteItem() {
    if (!accessToken) {
      setStatus("Devi prima fare login");
      return;
    }

    if (!selectedTemplateId) {
      setStatus("Seleziona prima un template");
      return;
    }

    if (!editItemDayId || !editItemMealId || !editItemId) {
      setStatus("Seleziona prima un item");
      return;
    }

    const shouldDelete = window.confirm(
      "Confermi l'eliminazione dell'item selezionato?"
    );

    if (!shouldDelete) {
      return;
    }

    setStatus("Eliminazione item in corso...");

    try {
      await deleteMealPlanTemplateItem(
        accessToken,
        selectedTemplateId,
        editItemDayId,
        editItemMealId,
        editItemId
      );

      const deletedItemDayId = editItemDayId;
      const deletedItemMealId = editItemMealId;

      const detail = await fetchMealPlanTemplateFull(accessToken, selectedTemplateId);
      setSelectedTemplateDetail(detail);

      const selectedMeal = getMealById(detail, deletedItemDayId, deletedItemMealId);
      setNewItemDayId(deletedItemDayId);
      setNewItemMealId(deletedItemMealId);
      setNewItemText("");
      setNewItemQuantityText("");
      setNewItemNotes("");
      setNewItemSortOrder(String(selectedMeal?.items.length || 0));

      syncEditItemFormFromDetail(detail);

      setStatus("Item eliminato");
    } catch (error) {
      setStatus(`Errore eliminazione item: ${String(error)}`);
    }
  }

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
        resetEditMealForm();
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
            creazione pasti, modifica pasti, creazione item, modifica item,
            eliminazione item e dettaglio completo del template.
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
          editMealDayId={editMealDayId}
          editMealId={editMealId}
          editMealLabel={editMealLabel}
          editMealSortOrder={editMealSortOrder}
          onEditMealDayIdChange={handleEditMealDayIdChange}
          onEditMealIdChange={handleEditMealIdChange}
          onEditMealLabelChange={setEditMealLabel}
          onEditMealSortOrderChange={setEditMealSortOrder}
          onSubmitEditMeal={handleUpdateMeal}
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
          onDeleteItem={handleDeleteItem}
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