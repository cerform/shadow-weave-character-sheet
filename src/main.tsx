import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SentryService } from "./services/SentryService";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Fonts
import "@fontsource/cormorant/400.css";
import "@fontsource/cormorant/500.css";
import "@fontsource/cormorant/600.css";
import "@fontsource/cormorant/700.css";
import "@fontsource/philosopher/400.css";
import "@fontsource/philosopher/700.css";

// Initialize Sentry
SentryService.init();

// Get root DOM node
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Failsafe check for Supabase config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  ReactDOM.createRoot(rootElement).render(
    <div style={{ 
      padding: '20px', 
      background: '#1a1a1a', 
      color: '#ff4444', 
      fontFamily: 'sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️ Missing Supabase Configuration</h1>
      <p style={{ color: '#ccc', marginBottom: '20px' }}>
        The environment variables <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are not set.
      </p>
      <div style={{ background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'left', fontSize: '14px' }}>
        <strong>To fix this:</strong>
        <ol style={{ marginTop: '10px' }}>
          <li>Go to Vercel Project Settings</li>
          <li>Add the variables in Environment Variables tab</li>
          <li>Trigger a Redeploy with "Clear Cache"</li>
        </ol>
      </div>
    </div>
  );
  throw new Error("Missing Supabase configuration. Blocking render.");
}

// Create React root ONCE.
// No manual unmounting, no DOM cleaning, no global root storage.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
