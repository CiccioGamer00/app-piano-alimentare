import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm.jsx";
import TemplateDetail from "./components/TemplateDetail.jsx";
import TemplatesList from "./components/TemplatesList.jsx";
import {
  API_BASE,
  fetchMealPlanTemplateFull,
  fetchMealPlanTemplates,
  loginWithPassword,
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
      setStatus("Dettaglio template caricato");
    } catch (error) {
      setStatus(`Errore caricamento dettaglio: ${String(error)}`);
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
            Area tecnica di lettura per verificare login, lista template e
            dettaglio completo del template.
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

      <section className="content-grid">
        <TemplatesList
          templates={templates}
          isAuthenticated={isAuthenticated}
          selectedTemplateId={selectedTemplateId}
          onLoadTemplates={handleLoadTemplates}
          onSelectTemplate={handleSelectTemplate}
        />

        <TemplateDetail template={selectedTemplateDetail} />
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