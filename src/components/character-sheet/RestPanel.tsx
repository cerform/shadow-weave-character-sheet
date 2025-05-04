
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Clock } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface RestPanelProps {
  compact?: boolean;
}

export const RestPanel = ({ compact = false }: RestPanelProps) => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleShortRest = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    // Определяем модификатор телосложения
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    // При коротком отдыхе игрок может потратить Hit Dice для восстановления здоровья
    // Получаем доступные Hit Dice
    const availableHitDice = character.hitDice !== undefined ? character.hitDice : character.level || 0;
    
    if (availableHitDice <= 0) {
      toast({
        title: "Недостаточно Hit Dice",
        description: "У вас нет доступных Hit Dice для восстановления здоровья",
        variant: "destructive"
      });
      return;
    }
    
    // Получаем размер Hit Die для класса
    const hitDieValue = getHitDieValue(character.className || '');
    
    // Вычисляем восстановление HP (среднее значение кубика + модификатор телосложения)
    const hpRecovery = Math.max(1, Math.floor(hitDieValue / 2) + conModifier);
    
    // Обновляем HP (не превышая максимум)
    const newCurrentHp = Math.min(
      character.maxHp || 0, 
      (character.currentHp || 0) + hpRecovery
    );
    
    // Уменьшаем количество доступных Hit Dice
    const newHitDice = availableHitDice - 1;
    
    // Обновляем персонажа
    updateCharacter({
      currentHp: newCurrentHp,
      hitDice: newHitDice
    });

    // Уведомляем игрока
    toast({
      title: "Короткий отдых",
      description: `Восстановлено ${hpRecovery} HP. Осталось Hit Dice: ${newHitDice}.`,
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
    
    // Восстанавливаем Hit Dice - при длинном отдыхе персонаж восстанавливает до половины от максимума
    const maxHitDice = character.level || 0;
    const currentHitDice = character.hitDice !== undefined ? character.hitDice : 0;
    const recoveredHitDice = Math.min(maxHitDice, currentHitDice + Math.floor(maxHitDice / 2));
    
    // Восстанавливаем очки чародея, если персонаж - Чародей
    let sorceryPoints = character.sorceryPoints || { current: 0, max: 0 };
    if (character.className?.toLowerCase().includes('чародей')) {
      sorceryPoints = {
        current: character.level || 0,
        max: character.level || 0
      };
    }
    
    // Обновляем персонажа
    updateCharacter({
      currentHp: fullHp,
      temporaryHp: 0, // Сбрасываем временное здоровье
      spellSlots: updatedSpellSlots,
      hitDice: recoveredHitDice,
      sorceryPoints: sorceryPoints
    });
    
    // Уведомляем игрока
    toast({
      title: "Длинный отдых",
      description: `Здоровье и ячейки заклинаний восстановлены. Hit Dice: ${currentHitDice} → ${recoveredHitDice}.`,
    });
  };

  // Получаем числовое значение кубика хитов для класса
  const getHitDieValue = (className: string): number => {
    const hitDiceValues: Record<string, number> = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Жрец": 8,
      "Друид": 8,
      "Волшебник": 6,
      "Чародей": 6,
      "Колдун": 8,
      "Чернокнижник": 8
    };
    
    return hitDiceValues[className] || 8;
  };

  if (compact) {
    return (
      <div className="flex flex-col space-y-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleShortRest}
          className="w-full flex items-center justify-center gap-1"
          style={{
            color: currentTheme.textColor,
            borderColor: currentTheme.accent
          }}
        >
          <Clock className="h-4 w-4 mr-1" />
          Короткий отдых {character?.hitDice ? `(HD: ${character.hitDice})` : ''}
        </Button>
        <Button 
          size="sm"
          onClick={handleLongRest}
          className="w-full flex items-center justify-center gap-1"
          style={{
            color: currentTheme.buttonText || '#FFFFFF',
            backgroundColor: currentTheme.accent
          }}
        >
          <Clock className="h-4 w-4 mr-1" />
          Длинный отдых
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4" 
          style={{ color: currentTheme.textColor }}>
        Отдых
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2" 
              style={{ color: currentTheme.textColor || '#FFFFFF' }}>
            Короткий отдых (1 час)
          </h4>
          <p className="text-sm mb-2"
             style={{ color: currentTheme.mutedTextColor || '#DDDDDD' }}>
            Восстанавливает часть здоровья. Hit Dice: {character?.hitDice || 0}/{character?.level || 0}
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleShortRest}
            style={{
              color: currentTheme.buttonText || '#FFFFFF',
              borderColor: currentTheme.accent
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            Короткий отдых
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2"
              style={{ color: currentTheme.textColor || '#FFFFFF' }}>
            Длинный отдых (8 часов)
          </h4>
          <p className="text-sm mb-2"
             style={{ color: currentTheme.mutedTextColor || '#DDDDDD' }}>
            Полностью восстанавливает здоровье и ячейки заклинаний. Восстанавливает часть Hit Dice.
          </p>
          <Button 
            className="w-full"
            onClick={handleLongRest}
            style={{
              color: currentTheme.buttonText || '#FFFFFF',
              backgroundColor: currentTheme.accent
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            Длинный отдых
          </Button>
        </div>
      </div>
    </Card>
  );
};
