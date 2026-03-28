import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Carico...");

  useEffect(() => {
    fetch("https://api.stemoro84.workers.dev/health")
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