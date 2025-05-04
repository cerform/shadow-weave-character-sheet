
import React from 'react';
import { CharacterSheet } from '@/types/character';

interface CharacterSkillsDisplayProps {
  character: CharacterSheet;
}

const CharacterSkillsDisplay: React.FC<CharacterSkillsDisplayProps> = ({ character }) => {
  return (
    <div className="skills-display">
      <h4 className="text-lg font-medium mb-2">Навыки персонажа</h4>
      {character.skills && Object.keys(character.skills).length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(character.skills).map(([skillName, details], index) => (
            details.proficient && (
              <div key={index} className="flex items-center">
                <span className="text-sm font-medium">{skillName}</span>
                {details.expertise && (
                  <span className="ml-2 text-xs bg-primary/20 rounded px-1.5 py-0.5">Мастерство</span>
                )}
              </div>
            )
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Нет владения навыками</p>
      )}
    </div>
  );
};

export default CharacterSkillsDisplay;
