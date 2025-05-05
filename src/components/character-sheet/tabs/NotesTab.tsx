
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface NotesTabProps {
  character?: any;
  onUpdate?: (updates: any) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ character, onUpdate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onUpdate && character) {
      onUpdate({
        ...character,
        notes: e.target.value
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Заметки</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={character?.notes || ''}
            onChange={handleChange}
            placeholder="Здесь вы можете записывать важные события, встречи с NPC, найденные предметы и другую информацию..."
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};
