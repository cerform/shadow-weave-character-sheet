import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SentryService } from "./services/SentryService";
import "@fontsource/cormorant/400.css";
import "@fontsource/cormorant/500.css";
import "@fontsource/cormorant/600.css";
import "@fontsource/cormorant/700.css";
import "@fontsource/philosopher/400.css";
import "@fontsource/philosopher/700.css";

// Инициализация Sentry
SentryService.init();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// 💣 Полная очистка контейнера перед созданием React root
rootElement.innerHTML = "";

// Очистка локального кэша (опционально)
try {
  localStorage.removeItem("characters");
  localStorage.removeItem("recentCharacters");
} catch (e) {
  console.warn("localStorage cleanup error:", e);
}

// Глобальная ссылка на root
declare global {
  interface Window {
    __REACT_ROOT__?: ReactDOM.Root;
  }
}

// 🧹 Безопасное размонтирование старого root, если был
if (window.__REACT_ROOT__) {
  try {
    window.__REACT_ROOT__.unmount();
    console.log("Previous React root unmounted safely");
  } catch (err) {
    console.warn("React unmount failed:", err);
  }
}

// 🚀 Создаём новый root и рендерим
const root = ReactDOM.createRoot(rootElement);
window.__REACT_ROOT__ = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
