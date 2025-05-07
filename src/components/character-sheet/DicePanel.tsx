
import React from 'react';
import { Character } from '@/types/character';
import { Token } from '@/stores/battleStore';

export interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  tokens?: Token[];
  selectedTokenId?: number | null;
  onSelectToken?: (id: number) => void;
  isDM?: boolean; // Добавляем опциональный параметр isDM
}

const DicePanel: React.FC<DicePanelProps> = ({ 
  character, 
  onUpdate, 
  tokens,
  selectedTokenId,
  onSelectToken,
  isDM
}) => {
  // Implementation here
  return (
    <div>
      {/* Dice panel content */}
      <span>Dice Panel for {character.name}</span>
      {isDM && <span> (DM Mode)</span>}
    </div>
  );
};

export default DicePanel;
