import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { Plus, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellSlotsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Обработчик изменения слотов заклинаний
  const handleSlotChange = (level: string, action: 'use' | 'restore') => {
    if (!character.spellSlots) return;

    const slot = character.spellSlots[level];
    if (!slot) return;

    const max = slot.max || 0;
    const used = slot.used || 0;

    // Обновляем только used, не добавляя current
    const newUsed = action === 'use' 
      ? Math.min(max, used + 1) 
      : Math.max(0, used - 1);

    const newSpellSlots = {
      ...character.spellSlots,
      [level]: {
        ...slot,
        used: newUsed
      }
    };

    onUpdate({ spellSlots: newSpellSlots });
  };

  // Обработчик сброса всех слотов (восстановление после отдыха)
  const handleResetAllSlots = () => {
    if (!character.spellSlots) return;

    const resetSlots = Object.entries(character.spellSlots).reduce((acc, [level, slot]) => {
      return {
        ...acc,
        [level]: {
          ...slot,
          used: 0
        }
      };
    }, {});

    onUpdate({ spellSlots: resetSlots });
  };

  // Если нет слотов заклинаний, не отображаем панель
  if (!character.spellSlots || Object.keys(character.spellSlots).length === 0) {
    return null;
  }

  // Получаем уровни слотов и сортируем их
  const levels = Object.keys(character.spellSlots)
    .sort((a, b) => {
      // Сортировка по уровню (числовому значению)
      const levelA = parseInt(a.replace('level', ''));
      const levelB = parseInt(b.replace('level', ''));
      return levelA - levelB;
    });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span style={{ color: currentTheme.textColor }}>Слоты заклинаний</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetAllSlots}
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.accent
            }}
          >
            Восстановить все
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {levels.map(level => {
            const slotData = character.spellSlots?.[level] || { max: 0, used: 0 };
            const available = Math.max(0, (slotData.max || 0) - (slotData.used || 0));
            
            return (
              <div key={level} className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>
                  {level.replace('level', 'Уровень ')}
                </span>
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSlotChange(level, 'restore')} 
                    disabled={slotData.used <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <span className="mx-2 min-w-8 text-center">
                    {available}/{slotData.max}
                  </span>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSlotChange(level, 'use')} 
                    disabled={(slotData.max || 0) - (slotData.used || 0) <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellSlotsPanel;
