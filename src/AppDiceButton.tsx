
import React from 'react';
import { useLocation } from 'react-router-dom';
import FloatingDiceButton from './components/dice/FloatingDiceButton';

export const AppDiceButton: React.FC = () => {
  const location = useLocation();
  
  // Исключаем страницы, на которых не нужно показывать плавающую кнопку кубиков
  const excludedPaths = [
    // Здесь можно добавить пути, где не нужно показывать кнопку кубиков
  ];
  
  // Проверяем, не находимся ли мы на странице из исключений
  const shouldRenderButton = !excludedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  if (!shouldRenderButton) {
    return null;
  }
  
  return <FloatingDiceButton />;
};

export default AppDiceButton;
