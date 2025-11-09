
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SentryService } from './services/SentryService'
import '@fontsource/cormorant/400.css'
import '@fontsource/cormorant/500.css'
import '@fontsource/cormorant/600.css'
import '@fontsource/cormorant/700.css'
import '@fontsource/philosopher/400.css'
import '@fontsource/philosopher/700.css'

// Инициализация Sentry
SentryService.init();


const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Очистка кэша локальных данных для избежания конфликтов
try {
  localStorage.removeItem('characters');
  localStorage.removeItem('recentCharacters');
} catch (error) {
  console.warn('localStorage cleanup error:', error);
}

// ✅ Создание root только если не существует (Lovable safe)
if (!rootElement.hasChildNodes()) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
