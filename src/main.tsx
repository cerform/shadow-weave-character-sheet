
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@fontsource/cormorant/400.css'
import '@fontsource/cormorant/500.css'
import '@fontsource/cormorant/600.css'
import '@fontsource/cormorant/700.css'
import '@fontsource/philosopher/400.css'
import '@fontsource/philosopher/700.css'


const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

// Очищаем localStorage для предотвращения конфликтов
try {
  localStorage.removeItem("characters");
  localStorage.removeItem("recentCharacters");
} catch (error) {
  console.warn('localStorage cleanup error:', error);
}

ReactDOM.createRoot(rootElement).render(
  <App />
);
