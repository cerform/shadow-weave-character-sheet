import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Character } from '@/types/character';

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ equipment: e.target.value.split('\n') });
  };

  return (
    <div>
      <Textarea
        placeholder="Оружие, доспехи, предметы..."
        className="min-h-[80px]"
        value={Array.isArray(character.equipment) ? character.equipment.join('\n') : (character.equipment?.items?.join('\n') || '')}
        onChange={handleEquipmentChange}
      />
    </div>
  );
};
