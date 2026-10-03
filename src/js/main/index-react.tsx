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

function showGlobalError(title: string, details: any) {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.bottom = '10px';
  errDiv.style.left = '10px';
  errDiv.style.right = '10px';
  errDiv.style.background = '#aa0000';
  errDiv.style.color = '#fff';
  errDiv.style.padding = '12px';
  errDiv.style.zIndex = '999999';
  errDiv.style.fontSize = '11px';
  errDiv.style.maxHeight = '200px';
  errDiv.style.overflow = 'auto';
  errDiv.style.borderRadius = '4px';
  errDiv.style.fontFamily = 'monospace';
  
  const closeBtn = document.createElement('button');
  closeBtn.innerText = 'Close';
  closeBtn.style.float = 'right';
  closeBtn.style.background = '#fff';
  closeBtn.style.color = '#000';
  closeBtn.style.border = 'none';
  closeBtn.style.padding = '2px 6px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => errDiv.remove();
  
  errDiv.innerHTML = `<strong>${title}</strong><br/><br/>${String(details?.stack || details?.message || details)}`;
  errDiv.prepend(closeBtn);
  document.body.appendChild(errDiv);
}

// Global Error Catching for cross-platform stability
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  showGlobalError("Unhandled Promise Rejection", event.reason);
});
window.addEventListener("error", (event) => {
  console.error("Uncaught exception:", event.error);
  showGlobalError("Uncaught Exception", event.error || event.message);
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
