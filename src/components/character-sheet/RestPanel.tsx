
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { Clock } from 'lucide-react';

export const RestPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();

  const handleShortRest = () => {
    if (!character) return;

    // Восстанавливаем Hit Dice (до половины максимума, округлённого вниз)
    const maxHitDiceRecovery = Math.floor(character.level / 2);
    
    // Обновляем здоровье (не восстанавливает всё HP)
    // Восстанавливается бонусом за телосложение + уровень
    const conModifier = Math.floor((character.abilities.CON - 10) / 2);
    const hpRecovery = Math.max(1, conModifier + 1);
    const newCurrentHp = Math.min(character.maxHp || 0, (character.currentHp || 0) + hpRecovery);
    
    // Обновляем свойства персонажа после короткого отдыха
    updateCharacter({
      currentHp: newCurrentHp
    });

    // Уведомляем игрока
    toast({
      title: "Короткий отдых",
      description: `Восстановлено ${hpRecovery} HP. Можно потратить Hit Dice для восстановления здоровья.`,
    });
  };

  const handleLongRest = () => {
    if (!character) return;

    // Восстанавливаем все HP
    const fullHp = character.maxHp || 0;
    
    // Восстанавливаем все ячейки заклинаний
    let updatedSpellSlots = { ...character.spellSlots };
    
    for (const level in updatedSpellSlots) {
      if (updatedSpellSlots.hasOwnProperty(level)) {
        updatedSpellSlots[level] = {
          ...updatedSpellSlots[level],
          used: 0
        };
      }
    }
    
    // Восстанавливаем Sorcery Points (если персонаж Чародей)
    let sorceryPoints = character.sorceryPoints || { current: 0, max: 0 };
    if (character.className?.includes('Чародей')) {
      sorceryPoints = {
        current: character.level,
        max: character.level
      };
    }
    
    // Обновляем свойства персонажа после длинного отдыха
    updateCharacter({
      currentHp: fullHp,
      spellSlots: updatedSpellSlots,
      sorceryPoints: sorceryPoints
    });
    
    // Уведомляем игрока
    toast({
      title: "Длинный отдых",
      description: "Все здоровье и ячейки заклинаний восстановлены.",
    });
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-primary">Отдых</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 text-primary/90">Короткий отдых (1 час)</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Восстанавливает часть здоровья и позволяет использовать Hit Dice.
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleShortRest}
          >
            <Clock className="mr-2 h-4 w-4" />
            Короткий отдых
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 text-primary/90">Длинный отдых (8 часов)</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Полностью восстанавливает здоровье и ячейки заклинаний.
          </p>
          <Button 
            className="w-full"
            onClick={handleLongRest}
          >
            <Clock className="mr-2 h-4 w-4" />
            Длинный отдых
          </Button>
        </div>
      </div>
    </Card>
  );
};
