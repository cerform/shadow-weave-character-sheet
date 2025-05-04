
import React from 'react';

interface BackgroundTabProps {
  character: any;
  onUpdate: (updates: any) => void;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      <h2>Предыстория персонажа</h2>
      <p>Страница в разработке</p>
    </div>
  );
};
