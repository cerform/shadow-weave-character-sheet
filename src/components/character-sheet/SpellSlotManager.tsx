
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { classData } from '@/data/classes';
import { useToast } from '@/hooks/use-toast';

interface SpellSlotManagerProps {
  character?: Character;
  showTitle?: boolean;
  compact?: boolean;
}

const SpellSlotManager: React.FC<SpellSlotManagerProps> = ({ 
  character: propCharacter, 
  showTitle = true,
  compact = false
}) => {
  const { character: contextCharacter, updateCharacter } = useCharacter();
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const character = propCharacter || contextCharacter;
  
  // Состояние для ячеек заклинаний
  const [spellSlots, setSpellSlots] = useState<Record<string, { max: number; used: number }>>({});
  
  // Получение максимального количества ячеек на основе класса и уровня
  const getMaxSpellSlots = (characterClass: string, level: number): Record<number, { max: number; used: number }> => {
    // Получаем данные о классе
    const classInfo = classData[characterClass];
    if (!classInfo || !classInfo.spellcasting || !classInfo.spellcasting.spellSlots) {
      return {};
    }
    
    // Создаем объект с ячейками заклинаний
    const slots: Record<number, { max: number; used: number }> = {};
    
    // Для каждого уровня заклинаний получаем количество ячеек
    for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
      const slotsByLevel = classInfo.spellcasting.spellSlots[spellLevel];
      
      if (slotsByLevel && Array.isArray(slotsByLevel) && slotsByLevel[level - 1] > 0) {
        slots[spellLevel] = {
          max: slotsByLevel[level - 1],
          used: 0 // По умолчанию ни одна ячейка не использована
        };
      }
    }
    
    return slots;
  };
  
  // Инициализация ячеек заклинаний при загрузке персонажа
  useEffect(() => {
    if (character && character.class) {
      // Если у персонажа уже есть сохраненные ячейки заклинаний, используем их
      if (character.spellSlots) {
        setSpellSlots(character.spellSlots);
      } else {
        // Иначе получаем ячейки заклинаний на основе класса и уровня
        const maxSlots = getMaxSpellSlots(character.class, character.level);
        setSpellSlots(maxSlots);
        
        // Сохраняем начальное состояние ячеек в персонажа
        updateCharacter({ spellSlots: maxSlots });
      }
    }
  }, [character?.class, character?.level, character?.spellSlots]);
  
  // Обработчик использования ячейки заклинаний
  const handleUseSpellSlot = (level: number) => {
    if (!spellSlots[level]) return;
    
    if (spellSlots[level].used < spellSlots[level].max) {
      const newSpellSlots = {
        ...spellSlots,
        [level]: {
          ...spellSlots[level],
          used: spellSlots[level].used + 1
        }
      };
      
      setSpellSlots(newSpellSlots);
      updateCharacter({ spellSlots: newSpellSlots });
      
      toast({
        title: "Ячейка заклинания использована",
        description: `Использована ячейка заклинания ${level} уровня`,
      });
    }
  };
  
  // Обработчик восстановления ячейки заклинаний
  const handleRestoreSpellSlot = (level: number) => {
    if (!spellSlots[level]) return;
    
    if (spellSlots[level].used > 0) {
      const newSpellSlots = {
        ...spellSlots,
        [level]: {
          ...spellSlots[level],
          used: spellSlots[level].used - 1
        }
      };
      
      setSpellSlots(newSpellSlots);
      updateCharacter({ spellSlots: newSpellSlots });
      
      toast({
        title: "Ячейка заклинания восстановлена",
        description: `Восстановлена ячейка заклинания ${level} уровня`,
      });
    }
  };
  
  // Обработчик восстановления всех ячеек заклинаний (после отдыха)
  const handleRestoreAllSpellSlots = () => {
    const newSpellSlots = { ...spellSlots };
    
    // Сбрасываем счетчики использованных ячеек
    for (const level in newSpellSlots) {
      newSpellSlots[level].used = 0;
    }
    
    setSpellSlots(newSpellSlots);
    updateCharacter({ spellSlots: newSpellSlots });
    
    toast({
      title: "Ячейки заклинаний восстановлены",
      description: "Все ячейки заклинаний восстановлены после отдыха",
    });
  };

  // Не отображаем компонент, если у персонажа нет магических способностей
  if (!character || !character.class) return null;
  
  // Проверяем, является ли класс магическим
  const characterClass = character.class.toLowerCase();
  const isMagicUser = ['жрец', 'волшебник', 'бард', 'друид', 'колдун', 'чародей', 'паладин', 'следопыт', 'изобретатель'].includes(characterClass);
  
  if (!isMagicUser) return null;

  // Проверяем наличие ячеек заклинаний
  const hasSpellSlots = Object.keys(spellSlots).length > 0;
  
  if (!hasSpellSlots) return null;
  
  return (
    <Card className={`border-accent/30 ${compact ? 'p-2' : ''}`} style={{ backgroundColor: currentTheme.cardBackground }}>
      {showTitle && (
        <CardHeader className={compact ? 'p-2' : ''}>
          <CardTitle className="flex justify-between items-center text-lg" style={{ color: currentTheme.textColor }}>
            <span>Ячейки заклинаний</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRestoreAllSpellSlots}
                    style={{ color: currentTheme.accent }}
                  >
                    Восстановить все
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Восстановить все ячейки заклинаний (после отдыха)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-2' : ''}>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(spellSlots).map(([level, { max, used }]) => (
            <div 
              key={`spell-slot-${level}`} 
              className="flex flex-col items-center border rounded-md p-2"
              style={{ borderColor: currentTheme.accent + '50' }}
            >
              <span className="text-sm font-bold mb-1" style={{ color: currentTheme.textColor }}>
                {level} уровень
              </span>
              <div className="flex space-x-1 mb-1">
                {Array.from({ length: max }).map((_, index) => (
                  <Badge
                    key={index}
                    variant={index < (max - used) ? "default" : "outline"}
                    style={{
                      backgroundColor: index < (max - used) ? currentTheme.accent : 'transparent',
                      borderColor: currentTheme.accent,
                      color: index < (max - used) ? currentTheme.cardBackground : currentTheme.accent
                    }}
                  >
                    ⬤
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-1 mt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={used >= max}
                  onClick={() => handleUseSpellSlot(Number(level))}
                  style={{ 
                    borderColor: currentTheme.accent, 
                    color: currentTheme.accent
                  }}
                  className="px-2 py-0 h-6 text-xs"
                >
                  -
                </Button>
                <span className="text-sm font-medium" style={{ color: currentTheme.textColor }}>
                  {max - used}/{max}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={used <= 0}
                  onClick={() => handleRestoreSpellSlot(Number(level))}
                  style={{ 
                    borderColor: currentTheme.accent, 
                    color: currentTheme.accent
                  }}
                  className="px-2 py-0 h-6 text-xs"
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellSlotManager;
