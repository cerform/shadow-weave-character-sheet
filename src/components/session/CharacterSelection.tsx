
import React from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface CharacterSelectionProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  onClose: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  characters,
  selectedCharacter,
  onSelectCharacter,
  onClose
}) => {
  return (
    <div className="space-y-4">
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-2">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`p-4 border rounded-md cursor-pointer transition-all ${
                selectedCharacter?.id === character.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSelectCharacter(character)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{character.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {character.race} {character.class} (Ур. {character.level})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground mb-2">У вас пока нет персонажей</p>
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button 
          disabled={!selectedCharacter}
          onClick={onClose}
        >
          Выбрать
        </Button>
      </div>
    </div>
  );
};

export default CharacterSelection;
