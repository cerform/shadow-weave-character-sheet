
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MoreHorizontal, Plus, Minus } from 'lucide-react';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellSlotsPopoverProps {
  level: number;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellSlotsPopover: React.FC<SpellSlotsPopoverProps> = ({ 
  level, 
  character, 
  onUpdate 
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleUseSlot = () => {
    if (!character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo || slotInfo.used >= slotInfo.max) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };

  const handleRestoreSlot = () => {
    if (!character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo || slotInfo.used <= 0) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };

  const handleRestoreAllSlots = () => {
    if (!character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: 0
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };

  const handleUseAllSlots = () => {
    if (!character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.max
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };

  if (!character.spellSlots || !character.spellSlots[level]) {
    return null;
  }

  const slotInfo = character.spellSlots[level];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-3" 
        style={{
          backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
          borderColor: currentTheme.accent
        }}
      >
        <div className="space-y-3">
          <h4 className="font-medium text-sm" style={{ color: currentTheme.textColor }}>
            Слоты {level}-го уровня
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleUseSlot}
              disabled={slotInfo.used >= slotInfo.max}
              className="w-full"
              style={{ 
                borderColor: currentTheme.accent,
                color: slotInfo.used >= slotInfo.max ? currentTheme.mutedTextColor : currentTheme.textColor
              }}
            >
              <Minus className="h-4 w-4 mr-1" /> Использовать
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRestoreSlot}
              disabled={slotInfo.used <= 0}
              className="w-full"
              style={{ 
                borderColor: currentTheme.accent,
                color: slotInfo.used <= 0 ? currentTheme.mutedTextColor : currentTheme.textColor
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Восстановить
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleUseAllSlots}
              disabled={slotInfo.used >= slotInfo.max}
              className="w-full"
              style={{ 
                borderColor: currentTheme.accent,
                color: slotInfo.used >= slotInfo.max ? currentTheme.mutedTextColor : currentTheme.textColor
              }}
            >
              Использовать все
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRestoreAllSlots}
              disabled={slotInfo.used <= 0}
              className="w-full"
              style={{ 
                borderColor: currentTheme.accent,
                color: slotInfo.used <= 0 ? currentTheme.mutedTextColor : currentTheme.textColor
              }}
            >
              Восстановить все
            </Button>
          </div>
          
          <div className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
            Использовано {slotInfo.used} из {slotInfo.max} слотов
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
