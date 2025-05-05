
import React from 'react';
import { Character } from '@/types/character';

interface CombatTabProps {
  character: Character | null;
}

export const CombatTab: React.FC<CombatTabProps> = ({ character }) => {
  return (
    <div className="p-4 bg-card/30 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Боевые параметры</h3>
      <div className="space-y-4">
        <div>
          <strong>Класс доспеха:</strong> {character?.armorClass || 10}
        </div>
        <div>
          <strong>Инициатива:</strong> {character?.initiative || 0}
        </div>
        <div>
          <strong>Максимум HP:</strong> {character?.maxHp || 0}
        </div>
        <div>
          <strong>Текущие HP:</strong> {character?.currentHp || 0}
        </div>
      </div>
    </div>
  );
};
