import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Character } from '@/types/character';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    onUpdate({ [name]: value });
  };

  return (
    <div>
      <div className="grid gap-4">
        <div>
          <Textarea
            name="features"
            placeholder="Классовые особенности, умения и другие особенности персонажа..."
            value={character.features || ""}
            onChange={handleInputChange}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturesTab;
