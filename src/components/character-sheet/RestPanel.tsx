
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Clock } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const RestPanel = () => {
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
    // Здесь мы даем фиксированное восстановление для простоты
    const hitDieValue = getHitDieValue(character.className || '');
    const hpRecovery = Math.max(1, hitDieValue/2 + conModifier);
    
    // Проверяем, чтобы не превысить максимальное HP
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
        current: character.level || 0,
        max: character.level || 0
      };
    }
    
    // Обновляем персонажа БЕЗ изменения темы
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
            Восстанавливает часть здоровья и позволяет использовать Hit Dice.
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
            Полностью восстанавливает здоровье и ячейки заклинаний.
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
