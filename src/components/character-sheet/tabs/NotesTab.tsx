import React, { useState } from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface NotesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ character, onUpdate }) => {
  const [notes, setNotes] = useState(character.backstory || '');
  
  const handleSaveNotes = () => {
    onUpdate({ backstory: notes });
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Заметки</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Запишите здесь важную информацию о приключениях, заметки о встреченных NPC, задания и другие детали..."
            className="min-h-[300px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button 
            onClick={handleSaveNotes} 
            className="mt-4 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Сохранить заметки
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
