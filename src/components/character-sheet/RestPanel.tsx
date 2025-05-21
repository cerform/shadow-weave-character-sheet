
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { toast } from 'sonner';

interface RestPanelProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  // Use the provided onUpdate or fall back to the context's updateCharacter
  const { updateCharacter: contextUpdateCharacter } = useCharacter();
  const updateCharacter = onUpdate || contextUpdateCharacter;

  // Обработчик короткого отдыха
  const handleShortRest = () => {
    // Обновляем ресурсы с recoveryType 'short' или 'short-rest'
    if (character.resources) {
      const updatedResources = { ...character.resources };
      Object.keys(updatedResources).forEach(key => {
        const resource = updatedResources[key];
        if (resource && (resource.recoveryType === 'short' || resource.recoveryType === 'short-rest')) {
          updatedResources[key] = {
            ...resource,
            used: 0 // Сбрасываем использованные ресурсы
          };
        }
      });
      
      // Обновляем персонажа
      updateCharacter({ resources: updatedResources });
    }
    
    toast.success("Короткий отдых завершён", {
      description: "Ваши ресурсы восстановлены."
    });
  };

  // Обработчик длинного отдыха
  const handleLongRest = () => {
    // Обновляем все ресурсы
    if (character.resources) {
      const updatedResources = { ...character.resources };
      Object.keys(updatedResources).forEach(key => {
        const resource = updatedResources[key];
        if (resource) {
          updatedResources[key] = {
            ...resource,
            used: 0 // Сбрасываем все использованные ресурсы
          };
        }
      });
      
      // Обновляем персонажа
      updateCharacter({ resources: updatedResources });
    }

    // Обновляем кости хитов (восстанавливаем половину)
    if (character.hitDice) {
      const maxRecovery = Math.max(1, Math.floor(character.level / 2));
      const currentUsed = character.hitDice.used || 0;
      const newUsed = Math.max(0, currentUsed - maxRecovery);
      
      updateCharacter({
        hitDice: {
          ...character.hitDice,
          used: newUsed
        }
      });
    }

    // Восстанавливаем хит-поинты до максимума
    updateCharacter({
      currentHp: character.maxHp,
      tempHp: 0
    });

    // Восстанавливаем очки колдовства (для чародея)
    if (character.sorceryPoints) {
      updateCharacter({
        sorceryPoints: {
          ...character.sorceryPoints,
          current: character.sorceryPoints.max
        }
      });
    }

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
            onClick={handleShortRest}
            className="w-full"
          >
            Короткий отдых
          </Button>
          
          <Button
            onClick={handleLongRest}
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
