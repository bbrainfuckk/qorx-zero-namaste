import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import { QorxZeroApp } from "../app/qorx-zero-app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QorxZeroApp />
  </StrictMode>,
);
