/**
 * Purpose: Presentational component for rendering one full meal plan template tree, its metadata edit form, the day creation form and the meal creation form.
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
}) {
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