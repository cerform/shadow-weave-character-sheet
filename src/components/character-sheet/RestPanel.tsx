
import React from 'react';
import { Character } from '@/types/character';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getMaxSpellLevel } from '@/utils/spellUtils';

interface RestPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();

  const handleShortRest = () => {
    // Восстанавливаем часть ресурсов, которые возвращаются после короткого отдыха
    
    // 1. Кости хитов (максимум половина от общего количества)
    const hitDice = character.hitDice || { total: 1, used: 0, dieType: 'd8', value: '1d8' };
    const recoveredHitDice = Math.min(
      Math.max(1, Math.floor(character.level / 2)),
      hitDice.used
    );
    
    const updatedHitDice = {
      ...hitDice,
      used: Math.max(0, hitDice.used - recoveredHitDice)
    };
    
    // 2. Восстанавливаем ресурсы, которые восстанавливаются после короткого отдыха
    const updatedResources = { ...character.resources };
    Object.keys(updatedResources).forEach(key => {
      const resource = updatedResources[key];
      if (resource.recoveryType === 'shortRest') {
        updatedResources[key] = {
          ...resource,
          used: 0
        };
      }
    });
    
    // 3. Восстанавливаем слоты заклинаний колдуна
    let updatedSpellSlots = { ...character.spellSlots };
    if (character.class?.toLowerCase() === 'колдун' || character.class?.toLowerCase() === 'warlock') {
      // У колдунов все слоты заклинаний одного уровня и восстанавливаются после короткого отдыха
      const warlockSlotLevel = Math.min(5, Math.ceil(character.level / 2));
      if (updatedSpellSlots && updatedSpellSlots[warlockSlotLevel]) {
        updatedSpellSlots[warlockSlotLevel] = {
          ...updatedSpellSlots[warlockSlotLevel],
          used: 0
        };
      }
    }

    // Применяем изменения
    onUpdate({
      hitDice: updatedHitDice,
      resources: updatedResources,
      spellSlots: updatedSpellSlots
    });
    
    toast({
      title: "Короткий отдых",
      description: `Восстановлено ${recoveredHitDice} костей хитов и некоторые ресурсы персонажа.`,
    });
  };

  const handleLongRest = () => {
    // Восстанавливаем все ресурсы после продолжительного отдыха
    
    // 1. Восстанавливаем здоровье до максимума
    const updatedHp = character.maxHp;
    
    // 2. Полностью восстанавливаем кости хитов
    const hitDice = character.hitDice || { total: 1, used: 0, dieType: 'd8', value: '1d8' };
    const recoveredHitDice = Math.max(1, Math.floor(hitDice.total / 2));
    
    const updatedHitDice = {
      ...hitDice,
      used: Math.max(0, hitDice.used - recoveredHitDice),
      value: `${hitDice.total}${hitDice.dieType}`
    };
    
    // 3. Восстанавливаем все ресурсы
    const updatedResources = { ...character.resources };
    Object.keys(updatedResources).forEach(key => {
      updatedResources[key] = {
        ...updatedResources[key],
        used: 0
      };
    });
    
    // 4. Восстанавливаем все слоты заклинаний
    let updatedSpellSlots = { ...character.spellSlots };
    if (updatedSpellSlots) {
      Object.keys(updatedSpellSlots).forEach(level => {
        updatedSpellSlots[parseInt(level)] = {
          ...updatedSpellSlots[parseInt(level)],
          used: 0
        };
      });
    }
    
    // 5. Восстанавливаем очки колдовства чародея
    let updatedSorceryPoints = character.sorceryPoints;
    if (updatedSorceryPoints) {
      updatedSorceryPoints = {
        ...updatedSorceryPoints,
        current: updatedSorceryPoints.max
      };
    }
    
    // Применяем изменения
    onUpdate({
      currentHp: updatedHp,
      hitDice: updatedHitDice,
      resources: updatedResources,
      spellSlots: updatedSpellSlots,
      temporaryHp: 0,
      sorceryPoints: updatedSorceryPoints
    });
    
    toast({
      title: "Продолжительный отдых",
      description: "Восстановлены хиты, кости хитов, слоты заклинаний и другие ресурсы персонажа.",
      variant: "default",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Отдых</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Короткий отдых позволяет восстановить часть ресурсов и использовать кости хитов.
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleShortRest}
          >
            Короткий отдых (1 час)
          </Button>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Продолжительный отдых восстанавливает хиты до максимума, половину костей хитов, все слоты заклинаний и особые ресурсы.
          </p>
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleLongRest}
          >
            Продолжительный отдых (8 часов)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
