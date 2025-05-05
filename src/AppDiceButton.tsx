
import React from 'react';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';

const AppDiceButton: React.FC = () => {
  // Убираем проверку маршрута, чтобы кнопка была доступна на всех страницах
  return <FloatingDiceButton />;
};

export default AppDiceButton;
