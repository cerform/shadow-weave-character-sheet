
import React from 'react';

interface AbilitiesTabProps {
  character: any;
  onUpdate: (updates: any) => void;
}

export const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      <h2>Характеристики персонажа</h2>
      <p>Страница в разработке</p>
    </div>
  );
};
