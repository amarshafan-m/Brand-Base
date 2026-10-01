import "./app.css";
import "./index.scss";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./main";
import { initUXP } from "./api/uxp";

console.clear(); // Clear logs on each reload

const renderApp = () => {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  ReactDOM.createRoot(appElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

if (document.getElementById("app")) {
  renderApp();
} else {
  document.addEventListener("DOMContentLoaded", renderApp, { once: true });
}

initUXP();
