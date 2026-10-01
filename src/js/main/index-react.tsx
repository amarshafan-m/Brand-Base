import "./app.css";
import "./index.scss";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./main";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initUXP } from "./api/uxp";
import { initializeCEP } from "../lib/utils/init-cep";
import { initBolt } from "../lib/utils/bolt";

console.clear();

// Global Error Catching for cross-platform stability
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
window.addEventListener("error", (event) => {
  console.error("Uncaught exception:", event.error);
});

const renderApp = () => {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  ReactDOM.createRoot(appElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
};

if (document.getElementById("app")) {
  renderApp();
} else {
  document.addEventListener("DOMContentLoaded", renderApp, { once: true });
}

initUXP();
// initBolt() internally calls initializeCEP(), so no separate call needed
initBolt(true);
