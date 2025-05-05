import React from 'react';
import { Character } from '@/contexts/CharacterContext';

interface BackgroundTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      {/* Background tab content */}
      <h2>Предыстория</h2>
      {/* Rest of the component */}
    </div>
  );
};
