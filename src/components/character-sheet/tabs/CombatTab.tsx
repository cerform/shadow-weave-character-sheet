
import React from 'react';

interface CombatTabProps {
  character: any;
  onUpdate: (updates: any) => void;
}

export const CombatTab: React.FC<CombatTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      <h2>Боевые характеристики</h2>
      <p>Страница в разработке</p>
    </div>
  );
};
