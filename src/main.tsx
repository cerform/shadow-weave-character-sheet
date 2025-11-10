
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

// Полная очистка старого root перед созданием нового (Vite HMR fix)
if ((rootElement as any)._reactRootContainer || rootElement.firstChild) {
  console.log('🔄 Очистка существующего React root для HMR');
  rootElement.innerHTML = '';
  delete (rootElement as any)._reactRootContainer;
}

// Создаём новый root после очистки
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Vite HMR: при горячей перезагрузке unmount'им root
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('🔥 HMR: Unmounting React root');
    root.unmount();
  });
}
