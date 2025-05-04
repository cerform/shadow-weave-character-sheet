
import React from 'react';
import { CharacterSheet } from '@/types/character';

interface CharacterSkillsDisplayProps {
  character: CharacterSheet;
}

const CharacterSkillsDisplay: React.FC<CharacterSkillsDisplayProps> = ({ character }) => {
  return (
    <div className="skills-display">
      {/* Этот компонент будет реализован позже */}
      <p className="text-gray-400 text-sm italic">Навыки не настроены</p>
    </div>
  );
};

export default CharacterSkillsDisplay;
