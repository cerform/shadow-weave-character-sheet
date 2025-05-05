
import React from 'react';
import { Character } from '@/types/character.d';

interface InventoryTabProps {
  character: Character | null;
  onUpdate: (updates: any) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ character, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Инвентарь</h2>
      
      <div className="bg-card/50 p-4 rounded-lg border border-border">
        <p className="text-muted-foreground">В этом разделе будет отображаться инвентарь вашего персонажа.</p>
      </div>
    </div>
  );
};

export default InventoryTab;
