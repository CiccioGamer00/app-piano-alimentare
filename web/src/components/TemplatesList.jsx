/**
 * Purpose: Presentational component for the meal plan templates list and selection action.
 * Direct dependencies: React.
 * Inputs/Outputs: receives templates array and callbacks from parent -> emits load/select actions.
 * Security: UI-only component; no token handling or API calls here.
 * Notes: Keeps empty-state rendering localized and simple.
 */

export default function TemplatesList({
  templates,
  onLoadTemplates,
  onSelectTemplate,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Template</h2>

        <button className="primary-button" onClick={onLoadTemplates} type="button">
          Carica template
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="muted-text">Nessun template caricato.</p>
      ) : (
        <ul className="template-list">
          {templates.map((template) => (
            <li className="template-list-item" key={template.id}>
              <div>
                <p className="template-name">{template.name}</p>
                <p className="template-id">ID: {template.id}</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => onSelectTemplate(template.id)}
                type="button"
              >
                Apri dettaglio
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}