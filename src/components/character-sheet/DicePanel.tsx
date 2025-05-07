
import React from 'react';
import { Character } from '@/types/character';

export interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  tokens?: any[];
  selectedTokenId?: number | null;
  onSelectToken?: (id: number) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ character, onUpdate }) => {
  // Implementation here
  return (
    <div>
      {/* Dice panel content */}
      <span>Dice Panel for {character.name}</span>
    </div>
  );
};

export default DicePanel;
