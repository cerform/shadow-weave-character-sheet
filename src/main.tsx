
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Оборачиваем рендер в try-catch для отлавливания ошибок
console.log('Инициализация приложения...');

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Не найден элемент с id 'root' для монтирования приложения");
  } else {
    console.log('Монтирование React приложения в DOM...');
    createRoot(rootElement).render(
      <App />
    );
    console.log('React приложение смонтировано успешно');
  }
} catch (error) {
  console.error("Критическая ошибка при рендере приложения:", error);
}
