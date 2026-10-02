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

// CRITICAL FIX: Prevent CEP Panel from navigating away if a user drops a file!
window.addEventListener("dragover", (e) => e.preventDefault(), false);
window.addEventListener("drop", (e) => e.preventDefault(), false);

// CRITICAL FIX: Disable right-click context menu to prevent showing 'Inspect Element' in production
const isDebug = window.location.search.includes("debug") || (typeof process !== 'undefined' && process.env?.NODE_ENV !== "production");
if (!isDebug) {
  window.addEventListener("contextmenu", (e) => e.preventDefault(), false);
}

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
