/**
 * Purpose: Presentational component for rendering one full meal plan template tree.
 * Direct dependencies: React.
 * Inputs/Outputs: receives the selected full template DTO from parent and renders nested days, meals and items.
 * Security: UI-only component; no direct API calls or credential handling here.
 * Notes: Handles empty states for missing detail, days, meals and items.
 */

export default function TemplateDetail({ template }) {
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
                              {meal.mealLabel} <span>(sortOrder: {meal.sortOrder})</span>
                            </p>

                            {meal.items.length === 0 ? (
                              <p className="muted-text">Nessun item.</p>
                            ) : (
                              <ul className="items-list">
                                {meal.items.map((item) => (
                                  <li key={item.id}>
                                    {item.itemText}
                                    {item.quantityText ? ` — ${item.quantityText}` : ""}
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