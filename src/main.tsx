
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


// Оборачиваем рендеринг приложения в try-catch для отлова ошибок инициализации
try {
  // Удаляем локальных персонажей при старте
  localStorage.removeItem("characters");
  localStorage.removeItem("recentCharacters"); // если используется
  localStorage.clear(); // если хочешь удалить всё

  console.log('main.tsx: Рендеринг корневого компонента');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('main.tsx: Рендеринг успешно выполнен');
} catch (error) {
  console.error('Ошибка при инициализации приложения:', error);
}
