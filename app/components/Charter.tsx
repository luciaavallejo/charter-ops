"use client";
import { useState, useEffect } from "react";

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", padding: 20 }}>
      <h1>✈️ Charter Ops</h1>
      <p>Si ves esto, funciona correctamente</p>
      <button onClick={() => alert("Hola")}>Click</button>
    </div>
  );
}