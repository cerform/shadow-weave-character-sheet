import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import '@fontsource/cormorant/400.css';
import '@fontsource/cormorant/500.css';
import '@fontsource/cormorant/600.css';
import '@fontsource/cormorant/700.css';
import '@fontsource/philosopher/400.css';
import '@fontsource/philosopher/700.css';

// ✅ Импортируй провайдер темы
import { UserThemeProvider } from '@/hooks/use-user-theme';

try {
  console.log('main.tsx: Рендеринг корневого компонента');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {/* Оборачиваем всё в UserThemeProvider */}
      <UserThemeProvider>
        <App />
      </UserThemeProvider>
    </React.StrictMode>
  );
  console.log('main.tsx: Рендеринг успешно выполнен');
} catch (error) {
  console.error('Ошибка при инициализации приложения:', error);
}
