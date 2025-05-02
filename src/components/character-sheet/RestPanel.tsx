
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Clock } from 'lucide-react';

export const RestPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();

  const handleShortRest = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    // Определяем максимальные Hit Dice, которые можно восстановить
    const maxHitDiceRecovery = Math.floor(character.level / 2);
    
    // Расчитываем восстановление здоровья
    // При коротком отдыхе игрок может потратить Hit Dice для восстановления здоровья
    // Но базовое восстановление равно модификатору телосложения (минимум 1)
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    const hpRecovery = Math.max(1, conModifier + 1);
    const newCurrentHp = Math.min(
      character.maxHp || 0, 
      (character.currentHp || 0) + hpRecovery
    );
    
    // Обновляем персонажа
    updateCharacter({
      currentHp: newCurrentHp
    });

    // Уведомляем игрока
    toast({
      title: "Короткий отдых",
      description: `Восстановлено ${hpRecovery} HP. Можно потратить Hit Dice для дополнительного восстановления здоровья.`,
    });
  };

  const handleLongRest = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    // При длинном отдыхе восстанавливаем все здоровье
    const fullHp = character.maxHp || 0;
    
    // Восстанавливаем все ячейки заклинаний, если они есть
    let updatedSpellSlots = { ...character.spellSlots };
    
    if (updatedSpellSlots) {
      for (const level in updatedSpellSlots) {
        if (updatedSpellSlots.hasOwnProperty(level)) {
          updatedSpellSlots[level] = {
            ...updatedSpellSlots[level],
            used: 0
          };
        }
      }
    }
    
    // Восстанавливаем очки чародея, если персонаж - Чародей
    let sorceryPoints = character.sorceryPoints || { current: 0, max: 0 };
    if (character.className?.toLowerCase().includes('чародей')) {
      sorceryPoints = {
        current: character.level,
        max: character.level
      };
    }
    
    // Обновляем персонажа
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
