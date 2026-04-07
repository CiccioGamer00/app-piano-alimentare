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

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">App Piano Alimentare</h1>
        <p className="app-subtitle">
          Frontend tecnico di verifica per login, lista template e dettaglio full.
        </p>
        <p className="api-base">
          <strong>API:</strong> {API_BASE}
        </p>
      </header>

      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />

      <TemplatesList
        templates={templates}
        onLoadTemplates={handleLoadTemplates}
        onSelectTemplate={handleSelectTemplate}
      />

      <TemplateDetail template={selectedTemplateDetail} />

      <section className="panel">
        <h2 className="panel-title">Stato applicazione</h2>
        <p>
          <strong>Stato:</strong> {status}
        </p>
        <p>
          <strong>Template attivo:</strong> {selectedTemplateId || "nessuno"}
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">Token</h2>
        <textarea className="token-box" readOnly value={accessToken} />
      </section>
    </div>
  );
}