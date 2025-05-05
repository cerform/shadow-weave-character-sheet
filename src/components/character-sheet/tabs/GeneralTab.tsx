
import React from 'react';
import { Character } from '@/types/character';

interface GeneralTabProps {
  character: Character | null;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ character }) => {
  return (
    <div className="p-4 bg-card/30 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Основная информация</h3>
      <div className="space-y-4">
        <div>
          <strong>Имя:</strong> {character?.name || 'Неизвестно'}
        </div>
        <div>
          <strong>Раса:</strong> {character?.race || 'Неизвестно'}
        </div>
        <div>
          <strong>Класс:</strong> {character?.class || character?.className || 'Неизвестно'}
        </div>
        <div>
          <strong>Уровень:</strong> {character?.level || 1}
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
