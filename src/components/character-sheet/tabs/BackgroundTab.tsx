import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Character } from '@/types/character';

interface BackgroundTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const BackgroundTab: React.FC<BackgroundTabProps> = ({ character, onUpdate }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: keyof Character) => {
    onUpdate({ [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-semibold">Личные качества</h4>
        <Textarea
          placeholder="Опишите личные качества вашего персонажа"
          value={character.personalityTraits || ""}
          onChange={(e) => handleInputChange(e, 'personalityTraits')}
        />
      </div>
      <div>
        <h4 className="text-md font-semibold">Идеалы</h4>
        <Textarea
          placeholder="Опишите идеалы вашего персонажа"
          value={character.ideals || ""}
          onChange={(e) => handleInputChange(e, 'ideals')}
        />
      </div>
      <div>
        <h4 className="text-md font-semibold">Привязанности</h4>
        <Textarea
          placeholder="Опишите привязанности вашего персонажа"
          value={character.bonds || ""}
          onChange={(e) => handleInputChange(e, 'bonds')}
        />
      </div>
      <div>
        <h4 className="text-md font-semibold">Слабости</h4>
        <Textarea
          placeholder="Опишите слабости вашего персонажа"
          value={character.flaws || ""}
          onChange={(e) => handleInputChange(e, 'flaws')}
        />
      </div>
      <div>
        <h4 className="text-md font-semibold">Внешность</h4>
        <Textarea
          placeholder="Опишите внешность вашего персонажа"
          value={character.appearance || ""}
          onChange={(e) => handleInputChange(e, 'appearance')}
        />
      </div>
      <div>
        <h4 className="text-md font-semibold">Предыстория</h4>
        <Textarea
          placeholder="Опишите предысторию вашего персонажа"
          value={character.backstory || ""}
          onChange={(e) => handleInputChange(e, 'backstory')}
        />
      </div>
    </div>
  );
};

export default BackgroundTab;

