
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Toaster } from '@/components/ui/toaster';
import { UserThemeProvider } from './hooks/use-user-theme';

// Импортируем шрифты
import '@fontsource/philosopher/400.css'; // Обычный
import '@fontsource/philosopher/700.css'; // Жирный
import '@fontsource/cormorant/400.css';   // Обычный
import '@fontsource/cormorant/600.css';   // Полужирный

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserThemeProvider>
        <App />
        <Toaster />
      </UserThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
