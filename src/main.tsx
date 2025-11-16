import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SentryService } from "./services/SentryService";

// Fonts
import "@fontsource/cormorant/400.css";
import "@fontsource/cormorant/500.css";
import "@fontsource/cormorant/600.css";
import "@fontsource/cormorant/700.css";
import "@fontsource/philosopher/400.css";
import "@fontsource/philosopher/700.css";

// Initialize Sentry
SentryService.init();

// Hook validator in development mode
if (import.meta.env.DEV) {
  import("./dev/HookValidator");
}

// Get root DOM node
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create React root ONCE.
// No manual unmounting, no DOM cleaning, no global root storage.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
