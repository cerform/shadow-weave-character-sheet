
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { handleShortRest, handleLongRest } from '@/utils/restUtils';

interface RestPanelProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  // Use the provided onUpdate or fall back to the context's updateCharacter
  const { updateCharacter: contextUpdateCharacter } = useCharacter();
  const updateCharacter = onUpdate || contextUpdateCharacter;

  // Обработчик короткого отдыха
  const handleShortRestClick = () => {
    if (!character) return;
    
    // Используем утилиту для обработки короткого отдыха
    const updates = handleShortRest(character);
    
    // Обновляем персонажа
    updateCharacter(updates);
    
    toast.success("Короткий отдых завершён", {
      description: "Ваши ресурсы восстановлены."
    });
  };

  // Обработчик длинного отдыха
  const handleLongRestClick = () => {
    if (!character) return;
    
    // Используем утилиту для обработки длинного отдыха
    const updates = handleLongRest(character);
    
    // Обновляем персонажа
    updateCharacter(updates);

    toast.success("Длинный отдых завершён", {
      description: "Ваши ресурсы и здоровье полностью восстановлены."
    });
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-medium">Отдых</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleShortRestClick}
            className="w-full"
          >
            Короткий отдых
          </Button>
          
          <Button
            onClick={handleLongRestClick}
            className="w-full"
          >
            Длинный отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
