
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Оборачиваем рендер в try-catch для отлавливания ошибок
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Не найден элемент с id 'root' для монтирования приложения");
  } else {
    createRoot(rootElement).render(
      <App />
    );
  }
} catch (error) {
  console.error("Критическая ошибка при рендере приложения:", error);
}
