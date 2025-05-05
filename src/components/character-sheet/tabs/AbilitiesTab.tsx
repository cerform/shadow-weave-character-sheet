
import React from 'react';
import { Character } from '@/types/character';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  // Keep existing component implementation
  return (
    <div>
      {/* Abilities tab content */}
      <h2>Характеристики персонажа</h2>
      {/* Rest of the component */}
    </div>
  );
};
