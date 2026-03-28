import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://api.stemoro84.workers.dev";

export default function App() {
  const [status, setStatus] = useState("Carico...");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((err) => setStatus("Errore: " + String(err)));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>App Piano Alimentare</h1>
      <p>API status: {status}</p>
      <p style={{ opacity: 0.7 }}>API: {API_BASE}</p>
    </div>
  );
}