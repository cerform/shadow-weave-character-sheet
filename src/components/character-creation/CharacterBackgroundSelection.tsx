
// Import dependencies
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { backgrounds } from '@/data/backgrounds';

export interface CharacterBackgroundSelectionProps {
  character: Character;
  onSelectionChange: (updates: Partial<Character>) => void;
  onConfirm: () => void;
}

// Component implementation
const CharacterBackgroundSelection: React.FC<CharacterBackgroundSelectionProps> = ({
  character,
  onSelectionChange,
  onConfirm
}) => {
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');

  useEffect(() => {
    if (selectedBackground) {
      const background = backgrounds.find(bg => bg.name === selectedBackground);
      if (background) {
        // Create a proper proficiencies object with the expected structure
        const proficiencies = {
          languages: background.proficiencies?.languages || [],
          tools: background.proficiencies?.tools ? 
            (typeof background.proficiencies.tools === 'string' ? 
              [background.proficiencies.tools] : background.proficiencies.tools) : [],
          skills: background.proficiencies?.skills || []
        };
        
        onSelectionChange({
          background: selectedBackground,
          proficiencies
        });
      }
    }
  }, [selectedBackground, onSelectionChange]);

  const handleBackgroundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBackground(event.target.value);
  };

  return (
    <div>
      <h2>Выберите предысторию персонажа</h2>
      <select value={selectedBackground} onChange={handleBackgroundChange}>
        <option value="">Выберите...</option>
        {backgrounds.map(background => (
          <option key={background.name} value={background.name}>{background.name}</option>
        ))}
      </select>
      <button onClick={onConfirm}>Подтвердить</button>
    </div>
  );
};

export default CharacterBackgroundSelection;
