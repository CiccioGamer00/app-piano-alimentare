import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Carico...");

  useEffect(() => {
    fetch("http://127.0.0.1:8787/health")
      .then((r) => r.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((err) => setStatus("Errore: " + String(err)));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>App Piano Alimentare</h1>
      <p>API status: {status}</p>
    </div>
  );
}