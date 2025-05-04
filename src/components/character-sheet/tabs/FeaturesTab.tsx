
import React from 'react';

interface FeaturesTabProps {
  character: any;
  onUpdate: (updates: any) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      <h2>Особенности персонажа</h2>
      <p>Страница в разработке</p>
    </div>
  );
};
