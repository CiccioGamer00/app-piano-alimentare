/**
 * Purpose: Presentational component for rendering one full meal plan template tree and its metadata edit form.
 * Direct dependencies: React.
 * Inputs/Outputs: receives the selected full template DTO plus edit form state/callbacks from parent and renders nested days, meals and items.
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