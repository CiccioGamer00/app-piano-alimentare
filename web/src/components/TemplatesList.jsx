/**
 * Purpose: Presentational component for the meal plan templates list and selection action.
 * Direct dependencies: React.
 * Inputs/Outputs: receives templates array, auth/selection state and callbacks from parent -> emits load/select actions.
 * Security: UI-only component; no token handling or API calls here.
 * Notes: Keeps empty-state rendering localized and disables actions when the user is not authenticated.
 */

export default function TemplatesList({
  templates,
  isAuthenticated,
  selectedTemplateId,
  onLoadTemplates,
  onSelectTemplate,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Template</h2>

        <button
          className="primary-button"
          onClick={onLoadTemplates}
          type="button"
          disabled={!isAuthenticated}
        >
          Carica template
        </button>
      </div>

      {!isAuthenticated ? (
        <p className="muted-text">
          Effettua il login per caricare e consultare i template.
        </p>
      ) : templates.length === 0 ? (
        <p className="muted-text">Nessun template caricato.</p>
      ) : (
        <ul className="template-list">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplateId;

            return (
              <li
                className={`template-list-item ${isSelected ? "is-selected" : ""}`}
                key={template.id}
              >
                <div>
                  <p className="template-name">{template.name}</p>
                  <p className="template-id">ID: {template.id}</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => onSelectTemplate(template.id)}
                  type="button"
                  disabled={!isAuthenticated}
                >
                  {isSelected ? "Dettaglio aperto" : "Apri dettaglio"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}