
import React from 'react';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import { useLocation } from 'react-router-dom';

const AppDiceButton: React.FC = () => {
  const location = useLocation();
  
  // Показываем кнопку на всех страницах
  return <FloatingDiceButton />;
};

export default AppDiceButton;
