import React from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RestPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  
  const resetShortRestResources = () => {
    if (!character.resources) return;
    
    // Обновляем ресурсы, которые восстанавливаются при коротком отдыхе
    const updatedResources = { ...character.resources };
    
    Object.keys(updatedResources).forEach(key => {
      const resource = updatedResources[key];
      // Используем shortRestRecover вместо recoveryType
      if (resource.shortRestRecover) {
        updatedResources[key] = {
          ...resource,
          used: 0
        };
      }
    });
    
    onUpdate({ resources: updatedResources });
    
    toast({
      title: "Короткий отдых",
      description: "Восстановлены ресурсы, восстанавливающиеся при коротком отдыхе.",
    });
  };
  
  const resetLongRestResources = () => {
    toast({
      title: "Долгий отдых",
      description: "Восстановлены все хиты и ресурсы.",
    });
    
    // Сбрасываем хиты до максимума
    const maxHp = character.maxHp || 1;
    const currentHp = maxHp;
    
    onUpdate({ currentHp: currentHp });
    
    if (character.resources) {
      const updatedResources = { ...character.resources };
      
      Object.keys(updatedResources).forEach(key => {
        const resource = updatedResources[key];
        // Используем longRestRecover или отсутствие shortRestRecover для восстановления при длинном отдыхе
        if (resource.longRestRecover || !resource.shortRestRecover) {
          updatedResources[key] = {
            ...resource,
            used: 0
          };
        }
      });
      
      onUpdate({ resources: updatedResources });
    }
  };
  
  return (
    <div className="rest-panel space-y-4">
      <h3 className="text-lg font-semibold">Отдых</h3>
      
      <div className="flex gap-2">
        <Button variant="secondary" onClick={resetShortRestResources}>
          Короткий отдых
        </Button>
        <Button onClick={resetLongRestResources}>
          Долгий отдых
        </Button>
      </div>
    </div>
  );
};

export default RestPanel;
