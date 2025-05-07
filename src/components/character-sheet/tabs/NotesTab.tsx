
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Character } from '@/types/character';

interface NotesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ character, onUpdate }) => {
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ notes: e.target.value });
  };

  return (
    <div>
      <Textarea
        placeholder="Дополнительные заметки о персонаже..."
        value={character.notes || ''}
        onChange={handleNotesChange}
        className="w-full h-60"
      />
    </div>
  );
};

export default NotesTab;
