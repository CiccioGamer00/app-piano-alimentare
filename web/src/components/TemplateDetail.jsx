/**
 * Purpose: Presentational component for rendering one full meal plan template tree, its metadata edit form, the day creation form, the meal creation form, the meal edit form, the item creation form, the item edit form and item delete action.
 * Direct dependencies: React.
 * Inputs/Outputs: receives the selected full template DTO plus edit/create form state and callbacks from parent and renders nested days, meals and items.
 * Security: UI-only component; no direct API calls or credential handling here.
 * Notes: Handles empty states for missing detail, days, meals and items.
 */

export default function TemplateDetail({
  template,
  isAuthenticated,
  editName,
  editDescription,
  editNotes,
  onEditNameChange,
  onEditDescriptionChange,
  onEditNotesChange,
  onSubmitEdit,
  newDayLabel,
  newDaySortOrder,
  onNewDayLabelChange,
  onNewDaySortOrderChange,
  onSubmitCreateDay,
  newMealDayId,
  newMealLabel,
  newMealSortOrder,
  onNewMealDayIdChange,
  onNewMealLabelChange,
  onNewMealSortOrderChange,
  onSubmitCreateMeal,
  editMealDayId,
  editMealId,
  editMealLabel,
  editMealSortOrder,
  onEditMealDayIdChange,
  onEditMealIdChange,
  onEditMealLabelChange,
  onEditMealSortOrderChange,
  onSubmitEditMeal,
  newItemDayId,
  newItemMealId,
  newItemText,
  newItemQuantityText,
  newItemNotes,
  newItemSortOrder,
  onNewItemDayIdChange,
  onNewItemMealIdChange,
  onNewItemTextChange,
  onNewItemQuantityTextChange,
  onNewItemNotesChange,
  onNewItemSortOrderChange,
  onSubmitCreateItem,
  editItemDayId,
  editItemMealId,
  editItemId,
  editItemText,
  editItemQuantityText,
  editItemNotes,
  editItemSortOrder,
  onEditItemDayIdChange,
  onEditItemMealIdChange,
  onEditItemIdChange,
  onEditItemTextChange,
  onEditItemQuantityTextChange,
  onEditItemNotesChange,
  onEditItemSortOrderChange,
  onSubmitEditItem,
  onDeleteItem,
}) {
  const selectedItemDay =
    template?.days.find((day) => day.id === newItemDayId) || null;

  const availableMealsForSelectedDay = selectedItemDay?.meals || [];

  const selectedEditMealDay =
    template?.days.find((day) => day.id === editMealDayId) || null;

  const availableMealsForEditMealDay = selectedEditMealDay?.meals || [];

  const selectedEditItemDay =
    template?.days.find((day) => day.id === editItemDayId) || null;

  const availableMealsForEditDay = selectedEditItemDay?.meals || [];

  const selectedEditItemMeal =
    availableMealsForEditDay.find((meal) => meal.id === editItemMealId) || null;

  const availableItemsForEditMeal = selectedEditItemMeal?.items || [];

  return (
    <section className="panel">
      <h2 className="panel-title">Dettaglio template</h2>

      {!template ? (
        <p className="muted-text">Nessun dettaglio caricato.</p>
      ) : (
        <div className="detail-layout">
          <div className="detail-summary">
            <p>
              <strong>Template selezionato:</strong> {template.name}
            </p>
            <p>
              <strong>ID:</strong> {template.id}
            </p>
            <p>
              <strong>Descrizione:</strong> {template.description || "—"}
            </p>
            <p>
              <strong>Note:</strong> {template.notes || "—"}
            </p>
          </div>

          <div>
            <h3 className="subsection-title">Modifica metadata</h3>

            <form onSubmit={onSubmitEdit}>
              <div className="field">
                <label className="field-label" htmlFor="edit-template-name">
                  Nome template
                </label>
                <input
                  className="field-input"
                  id="edit-template-name"
                  type="text"
                  value={editName}
                  onChange={(event) => onEditNameChange(event.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="field">
                <label
                  className="field-label"
                  htmlFor="edit-template-description"
                >
                  Descrizione
                </label>
                <textarea
                  className="field-input"
                  id="edit-template-description"
                  rows={3}
                  value={editDescription}
                  onChange={(event) =>
                    onEditDescriptionChange(event.target.value)
                  }
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-template-notes">
                  Note
                </label>
                <textarea
                  className="field-input"
                  id="edit-template-notes"
                  rows={3}
                  value={editNotes}
                  onChange={(event) => onEditNotesChange(event.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="session-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!isAuthenticated}
                >
                  Salva modifiche
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="subsection-title">Aggiungi giorno</h3>

            <form onSubmit={onSubmitCreateDay}>
              <div className="field">
                <label className="field-label" htmlFor="new-day-label">
                  Nome giorno
                </label>
                <input
                  className="field-input"
                  id="new-day-label"
                  type="text"
                  value={newDayLabel}
                  onChange={(event) => onNewDayLabelChange(event.target.value)}
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-day-sort-order">
                  Ordine
                </label>
                <input
                  className="field-input"
                  id="new-day-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={newDaySortOrder}
                  onChange={(event) =>
                    onNewDaySortOrderChange(event.target.value)
                  }
                  disabled={!isAuthenticated}
                />
              </div>

              <div className="session-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!isAuthenticated}
                >
                  Aggiungi giorno
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="subsection-title">Aggiungi pasto</h3>

            <form onSubmit={onSubmitCreateMeal}>
              <div className="field">
                <label className="field-label" htmlFor="new-meal-day-id">
                  Giorno
                </label>
                <select
                  className="field-input"
                  id="new-meal-day-id"
                  value={newMealDayId}
                  onChange={(event) => onNewMealDayIdChange(event.target.value)}
                  disabled={!isAuthenticated || template.days.length === 0}
                >
                  <option value="">Seleziona un giorno</option>

                  {template.days.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.dayLabel} (sortOrder: {day.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-meal-label">
                  Nome pasto
                </label>
                <input
                  className="field-input"
                  id="new-meal-label"
                  type="text"
                  value={newMealLabel}
                  onChange={(event) => onNewMealLabelChange(event.target.value)}
                  disabled={!isAuthenticated || template.days.length === 0}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-meal-sort-order">
                  Ordine
                </label>
                <input
                  className="field-input"
                  id="new-meal-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={newMealSortOrder}
                  onChange={(event) =>
                    onNewMealSortOrderChange(event.target.value)
                  }
                  disabled={!isAuthenticated || template.days.length === 0}
                />
              </div>

              <div className="session-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!isAuthenticated || template.days.length === 0}
                >
                  Aggiungi pasto
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="subsection-title">Modifica pasto</h3>

            <form onSubmit={onSubmitEditMeal}>
              <div className="field">
                <label className="field-label" htmlFor="edit-meal-day-id">
                  Giorno
                </label>
                <select
                  className="field-input"
                  id="edit-meal-day-id"
                  value={editMealDayId}
                  onChange={(event) => onEditMealDayIdChange(event.target.value)}
                  disabled={!isAuthenticated || template.days.length === 0}
                >
                  <option value="">Seleziona un giorno</option>

                  {template.days.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.dayLabel} (sortOrder: {day.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-meal-id">
                  Pasto
                </label>
                <select
                  className="field-input"
                  id="edit-meal-id"
                  value={editMealId}
                  onChange={(event) => onEditMealIdChange(event.target.value)}
                  disabled={
                    !isAuthenticated || availableMealsForEditMealDay.length === 0
                  }
                >
                  <option value="">Seleziona un pasto</option>

                  {availableMealsForEditMealDay.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.mealLabel} (sortOrder: {meal.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-meal-label">
                  Nome pasto
                </label>
                <input
                  className="field-input"
                  id="edit-meal-label"
                  type="text"
                  value={editMealLabel}
                  onChange={(event) => onEditMealLabelChange(event.target.value)}
                  disabled={!isAuthenticated || !editMealId}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-meal-sort-order">
                  Ordine
                </label>
                <input
                  className="field-input"
                  id="edit-meal-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={editMealSortOrder}
                  onChange={(event) =>
                    onEditMealSortOrderChange(event.target.value)
                  }
                  disabled={!isAuthenticated || !editMealId}
                />
              </div>

              <div className="session-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!isAuthenticated || !editMealId}
                >
                  Salva pasto
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="subsection-title">Aggiungi item</h3>

            <form onSubmit={onSubmitCreateItem}>
              <div className="field">
                <label className="field-label" htmlFor="new-item-day-id">
                  Giorno
                </label>
                <select
                  className="field-input"
                  id="new-item-day-id"
                  value={newItemDayId}
                  onChange={(event) => onNewItemDayIdChange(event.target.value)}
                  disabled={!isAuthenticated || template.days.length === 0}
                >
                  <option value="">Seleziona un giorno</option>

                  {template.days.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.dayLabel} (sortOrder: {day.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-item-meal-id">
                  Pasto
                </label>
                <select
                  className="field-input"
                  id="new-item-meal-id"
                  value={newItemMealId}
                  onChange={(event) => onNewItemMealIdChange(event.target.value)}
                  disabled={
                    !isAuthenticated || availableMealsForSelectedDay.length === 0
                  }
                >
                  <option value="">Seleziona un pasto</option>

                  {availableMealsForSelectedDay.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.mealLabel} (sortOrder: {meal.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-item-text">
                  Testo item
                </label>
                <input
                  className="field-input"
                  id="new-item-text"
                  type="text"
                  value={newItemText}
                  onChange={(event) => onNewItemTextChange(event.target.value)}
                  disabled={
                    !isAuthenticated || availableMealsForSelectedDay.length === 0
                  }
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-item-quantity-text">
                  Quantità
                </label>
                <input
                  className="field-input"
                  id="new-item-quantity-text"
                  type="text"
                  value={newItemQuantityText}
                  onChange={(event) =>
                    onNewItemQuantityTextChange(event.target.value)
                  }
                  disabled={
                    !isAuthenticated || availableMealsForSelectedDay.length === 0
                  }
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-item-notes">
                  Note
                </label>
                <textarea
                  className="field-input"
                  id="new-item-notes"
                  rows={3}
                  value={newItemNotes}
                  onChange={(event) => onNewItemNotesChange(event.target.value)}
                  disabled={
                    !isAuthenticated || availableMealsForSelectedDay.length === 0
                  }
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="new-item-sort-order">
                  Ordine
                </label>
                <input
                  className="field-input"
                  id="new-item-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={newItemSortOrder}
                  onChange={(event) =>
                    onNewItemSortOrderChange(event.target.value)
                  }
                  disabled={
                    !isAuthenticated || availableMealsForSelectedDay.length === 0
                  }
                />
              </div>

              <div className="session-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={
                    !isAuthenticated || availableMealsForSelectedDay.length === 0
                  }
                >
                  Aggiungi item
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="subsection-title">Modifica item</h3>

            <form onSubmit={onSubmitEditItem}>
              <div className="field">
                <label className="field-label" htmlFor="edit-item-day-id">
                  Giorno
                </label>
                <select
                  className="field-input"
                  id="edit-item-day-id"
                  value={editItemDayId}
                  onChange={(event) => onEditItemDayIdChange(event.target.value)}
                  disabled={!isAuthenticated || template.days.length === 0}
                >
                  <option value="">Seleziona un giorno</option>

                  {template.days.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.dayLabel} (sortOrder: {day.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-item-meal-id">
                  Pasto
                </label>
                <select
                  className="field-input"
                  id="edit-item-meal-id"
                  value={editItemMealId}
                  onChange={(event) => onEditItemMealIdChange(event.target.value)}
                  disabled={!isAuthenticated || availableMealsForEditDay.length === 0}
                >
                  <option value="">Seleziona un pasto</option>

                  {availableMealsForEditDay.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.mealLabel} (sortOrder: {meal.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-item-id">
                  Item
                </label>
                <select
                  className="field-input"
                  id="edit-item-id"
                  value={editItemId}
                  onChange={(event) => onEditItemIdChange(event.target.value)}
                  disabled={!isAuthenticated || availableItemsForEditMeal.length === 0}
                >
                  <option value="">Seleziona un item</option>

                  {availableItemsForEditMeal.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemText} (sortOrder: {item.sortOrder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-item-text">
                  Testo item
                </label>
                <input
                  className="field-input"
                  id="edit-item-text"
                  type="text"
                  value={editItemText}
                  onChange={(event) => onEditItemTextChange(event.target.value)}
                  disabled={!isAuthenticated || !editItemId}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-item-quantity-text">
                  Quantità
                </label>
                <input
                  className="field-input"
                  id="edit-item-quantity-text"
                  type="text"
                  value={editItemQuantityText}
                  onChange={(event) =>
                    onEditItemQuantityTextChange(event.target.value)
                  }
                  disabled={!isAuthenticated || !editItemId}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-item-notes">
                  Note
                </label>
                <textarea
                  className="field-input"
                  id="edit-item-notes"
                  rows={3}
                  value={editItemNotes}
                  onChange={(event) => onEditItemNotesChange(event.target.value)}
                  disabled={!isAuthenticated || !editItemId}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="edit-item-sort-order">
                  Ordine
                </label>
                <input
                  className="field-input"
                  id="edit-item-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={editItemSortOrder}
                  onChange={(event) =>
                    onEditItemSortOrderChange(event.target.value)
                  }
                  disabled={!isAuthenticated || !editItemId}
                />
              </div>

              <div className="session-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!isAuthenticated || !editItemId}
                >
                  Salva item
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={onDeleteItem}
                  disabled={!isAuthenticated || !editItemId}
                >
                  Elimina item
                </button>
              </div>
            </form>
          </div>

          <div>
            <h3 className="subsection-title">Giorni</h3>

            {template.days.length === 0 ? (
              <p className="muted-text">Nessun giorno presente.</p>
            ) : (
              <ul className="tree-list">
                {template.days.map((day) => (
                  <li className="tree-list-item" key={day.id}>
                    <p className="tree-title">
                      {day.dayLabel} <span>(sortOrder: {day.sortOrder})</span>
                    </p>

                    {day.meals.length === 0 ? (
                      <p className="muted-text">Nessun pasto.</p>
                    ) : (
                      <ul className="tree-sublist">
                        {day.meals.map((meal) => (
                          <li className="tree-sublist-item" key={meal.id}>
                            <p className="tree-title">
                              {meal.mealLabel}{" "}
                              <span>(sortOrder: {meal.sortOrder})</span>
                            </p>

                            {meal.items.length === 0 ? (
                              <p className="muted-text">Nessun item.</p>
                            ) : (
                              <ul className="items-list">
                                {meal.items.map((item) => (
                                  <li key={item.id}>
                                    {item.itemText}
                                    {item.quantityText
                                      ? ` — ${item.quantityText}`
                                      : ""}
                                    {item.notes ? ` (${item.notes})` : ""}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}