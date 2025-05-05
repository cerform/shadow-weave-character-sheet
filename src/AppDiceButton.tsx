
import React from 'react';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import { useLocation } from 'react-router-dom';

const AppDiceButton: React.FC = () => {
  // Убираем проверку маршрута, чтобы кнопка была доступна на всех страницах
  return <FloatingDiceButton />;
};

export default AppDiceButton;
