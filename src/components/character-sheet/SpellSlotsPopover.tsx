
import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus } from "lucide-react";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellSlotProps {
  level: number;
  used?: number;
  max?: number;
  onUse?: () => void;
  onRestore?: () => void;
  character?: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

export const SpellSlotsPopover: React.FC<SpellSlotProps> = ({ 
  level, 
  used, 
  max, 
  onUse, 
  onRestore,
  character,
  onUpdate
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // If character and onUpdate are provided, we'll manage slots internally
  const handleUseSlot = () => {
    if (character && onUpdate) {
      const updatedSpellSlots = { ...(character.spellSlots || {}) };
      const currentSlot = updatedSpellSlots[level] || { max: 0, used: 0 };
      if (currentSlot.used < currentSlot.max) {
        updatedSpellSlots[level] = { ...currentSlot, used: currentSlot.used + 1 };
        onUpdate({ spellSlots: updatedSpellSlots });
      }
    } else if (onUse) {
      onUse();
    }
  };
  
  const handleRestoreSlot = () => {
    if (character && onUpdate) {
      const updatedSpellSlots = { ...(character.spellSlots || {}) };
      const currentSlot = updatedSpellSlots[level] || { max: 0, used: 0 };
      if (currentSlot.used > 0) {
        updatedSpellSlots[level] = { ...currentSlot, used: currentSlot.used - 1 };
        onUpdate({ spellSlots: updatedSpellSlots });
      }
    } else if (onRestore) {
      onRestore();
    }
  };
  
  // Get slot info either from props or from character
  const slotUsed = used !== undefined ? used : (character?.spellSlots?.[level]?.used || 0);
  const slotMax = max !== undefined ? max : (character?.spellSlots?.[level]?.max || 0);
  
  // Get background color based on level
  const getBgColor = () => {
    if (currentTheme.spellLevels && currentTheme.spellLevels[level]) {
      return currentTheme.spellLevels[level];
    }
    
    const defaultColors = [
      '#6b7280', // Level 0 (cantrips)
      '#10b981', // Level 1
      '#3b82f6', // Level 2
      '#8b5cf6', // Level 3
      '#ec4899', // Level 4
      '#f59e0b', // Level 5
      '#ef4444', // Level 6
      '#6366f1', // Level 7
      '#0ea5e9', // Level 8
      '#7c3aed'  // Level 9
    ];
    
    return defaultColors[level] || defaultColors[0];
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center justify-between min-w-[100px]"
          style={{ 
            borderColor: getBgColor() + '80',
            backgroundColor: getBgColor() + '20' 
          }}
        >
          <span>Уровень {level}</span>
          <span className="ml-2 font-bold">
            {slotUsed}/{slotMax}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4">
        <div className="space-y-3">
          <h4 className="font-medium text-center">Слоты {level} уровня</h4>
          
          <div className="flex justify-between items-center">
            <span>Использовано:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleRestoreSlot}
                disabled={slotUsed <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold min-w-[20px] text-center">
                {slotUsed}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleUseSlot}
                disabled={slotUsed >= slotMax}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Всего слотов:</span>
            <span className="text-lg font-bold">{slotMax}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Осталось:</span>
            <span className="text-lg font-bold">{slotMax - slotUsed}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SpellSlotsPopover;
