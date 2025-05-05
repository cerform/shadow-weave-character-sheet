
import React, { useState } from 'react';
import { Character } from '@/types/character.d';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BackstoryTabProps {
  character: Character | null;
  onUpdate: (updates: any) => void;
}

export const BackstoryTab: React.FC<BackstoryTabProps> = ({ character, onUpdate }) => {
  const [backstory, setBackstory] = useState(character?.backstory || '');
  
  const handleSaveBackstory = () => {
    if (onUpdate && character) {
      onUpdate({ backstory });
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Предыстория персонажа</h2>
      
      <Textarea
        placeholder="Опишите историю вашего персонажа..."
        className="min-h-[300px]"
        value={backstory}
        onChange={(e) => setBackstory(e.target.value)}
      />
      
      <Button onClick={handleSaveBackstory}>Сохранить предысторию</Button>
    </div>
  );
};
