
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
    if (!character.resources) {
      toast({
        title: "Короткий отдых",
        description: "У персонажа нет ресурсов, которые восстанавливаются при коротком отдыхе.",
      });
      return;
    }
    
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
    
    const updates: Partial<Character> = {};
    updates.resources = updatedResources;
    
    onUpdate(updates);
    
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
    
    let updates: Partial<Character> = { 
      currentHp: currentHp 
    };
    
    // Восстанавливаем кости хитов (до половины от максимума при длительном отдыхе)
    if (character.hitDice) {
      const recoveredDice = Math.max(1, Math.floor(character.hitDice.total / 2));
      const newUsed = Math.max(0, character.hitDice.used - recoveredDice);
      
      updates.hitDice = {
        ...character.hitDice,
        used: newUsed
      };
    }
    
    // Восстанавливаем очки заклинаний
    if (character.spellSlots) {
      const updatedSpellSlots = { ...character.spellSlots };
      
      Object.keys(updatedSpellSlots).forEach(level => {
        updatedSpellSlots[level] = {
          ...updatedSpellSlots[level],
          used: 0
        };
      });
      
      updates.spellSlots = updatedSpellSlots;
    }
    
    // Восстанавливаем очки колдовства
    if (character.sorceryPoints) {
      updates.sorceryPoints = {
        ...character.sorceryPoints,
        current: character.sorceryPoints.max
      };
    }
    
    // Восстанавливаем все ресурсы
    if (character.resources) {
      const updatedResources = { ...character.resources };
      
      Object.keys(updatedResources).forEach(key => {
        const resource = updatedResources[key];
        // Восстанавливаем все ресурсы при длительном отдыхе или те, которые помечены как longRestRecover
        if (resource.longRestRecover || !resource.shortRestRecover) {
          updatedResources[key] = {
            ...resource,
            used: 0
          };
        }
      });
      
      updates.resources = updatedResources;
    }
    
    // Обновляем персонажа
    onUpdate(updates);
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
