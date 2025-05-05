
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';

interface NotesTabProps {
  character: Character | null;
}

export const NotesTab: React.FC<NotesTabProps> = ({ character }) => {
  const [notes, setNotes] = useState(character?.notes || '');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setUnsavedChanges(true);
  };
  
  const saveNotes = () => {
    // В реальном приложении здесь будет логика сохранения заметок
    // через контекст или API
    toast.success('Заметки сохранены');
    setUnsavedChanges(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Заметки</h2>
        <Button 
          onClick={saveNotes} 
          disabled={!unsavedChanges}
          variant={unsavedChanges ? "default" : "outline"}
        >
          Сохранить
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <Textarea 
            value={notes} 
            onChange={handleNotesChange} 
            className="min-h-[400px]"
            placeholder="Введите заметки для вашего персонажа..."
          />
        </CardContent>
      </Card>
    </div>
  );
};
