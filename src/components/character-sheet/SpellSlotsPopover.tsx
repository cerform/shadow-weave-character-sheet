
import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Character } from '@/types/character';

export interface SpellSlotsPopoverProps {
  level: number;
  currentSlots?: number;
  maxSlots?: number;
  onSlotsChange?: (newSlots: number) => void;
  disabled?: boolean;
  character?: Character; // Добавляем опциональный character prop
  onUpdate?: (updates: Partial<Character>) => void; // Добавляем опциональный onUpdate prop
}

export const SpellSlotsPopover: React.FC<SpellSlotsPopoverProps> = ({ 
  level, 
  currentSlots = 0, 
  maxSlots = 0, 
  onSlotsChange, 
  disabled = false,
  character,
  onUpdate
}) => {
  
  // Функция для обработки изменения слотов через оба варианта API
  const handleSlotChange = (newSlots: number) => {
    // Если передан onSlotsChange, используем его
    if (onSlotsChange) {
      onSlotsChange(newSlots);
    }
    // Если передан character и onUpdate, используем их
    else if (character && onUpdate) {
      const updatedSpellSlots = { ...character.spellSlots };
      
      // Проверяем, существует ли структура spellSlots[level]
      if (!updatedSpellSlots[level] || typeof updatedSpellSlots[level] === 'number') {
        // Если это число или слота нет, создаем структуру
        updatedSpellSlots[level] = { max: maxSlots, used: maxSlots - newSlots };
      } else {
        // Если это объект, обновляем used
        updatedSpellSlots[level] = {
          ...updatedSpellSlots[level],
          used: maxSlots - newSlots
        };
      }
      
      onUpdate({ spellSlots: updatedSpellSlots });
    }
  };
  
  // Получаем текущее значение слотов из любого источника
  const currentValue = character && character.spellSlots && character.spellSlots[level] 
    ? (typeof character.spellSlots[level] === 'number' 
      ? character.spellSlots[level] 
      : (character.spellSlots[level].max - character.spellSlots[level].used))
    : currentSlots;
  
  // Получаем максимальное значение слотов
  const maxValue = character && character.spellSlots && character.spellSlots[level] && typeof character.spellSlots[level] !== 'number' 
    ? character.spellSlots[level].max
    : maxSlots;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7" 
          disabled={disabled}
        >
          {currentValue} / {maxValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Ячейки заклинаний {level}-го уровня</h4>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: maxValue + 1 }).map((_, i) => (
              <Button
                key={i}
                variant={currentValue === i ? "default" : "outline"}
                size="sm"
                className="w-8 h-8"
                onClick={() => handleSlotChange(i)}
              >
                {i}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SpellSlotsPopover;
