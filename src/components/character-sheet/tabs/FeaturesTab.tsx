import React from 'react';
import { Character } from '@/contexts/CharacterContext';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      {/* Features tab content */}
      <h2>Особенности</h2>
      {/* Rest of the component */}
    </div>
  );
};
