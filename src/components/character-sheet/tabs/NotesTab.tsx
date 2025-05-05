
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NotesTabProps {
  character: Character | null;
}

export const NotesTab: React.FC<NotesTabProps> = ({ character }) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState(character?.notes || "");
  
  const handleSaveNotes = () => {
    // Здесь будет логика сохранения заметок
    toast({
      title: "Заметки сохранены",
      description: "Ваши заметки были успешно сохранены",
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Заметки персонажа</h2>
        <Button onClick={handleSaveNotes}>Сохранить</Button>
      </div>
      
      <Textarea 
        placeholder="Добавьте здесь заметки о вашем персонаже, важные события, напоминания и т.д."
        className="min-h-[400px]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};
