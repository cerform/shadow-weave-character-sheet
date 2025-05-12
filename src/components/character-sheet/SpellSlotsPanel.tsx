
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SpellSlotsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({ 
  character, 
  onUpdate 
}) => {
  // Обработчик использования ячейки заклинания
  const useSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used >= slotInfo.max) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    // Если есть свойство current, обновляем его
    if ('current' in slotInfo) {
      updatedSpellSlots[level] = {
        ...updatedSpellSlots[level],
        current: Math.max(0, (slotInfo.current || slotInfo.max) - 1)
      };
    }
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };
  
  // Обработчик восстановления ячейки заклинания
  const restoreSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used <= 0) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1
    };
    
    // Если есть свойство current, обновляем его
    if ('current' in slotInfo) {
      updatedSpellSlots[level] = {
        ...updatedSpellSlots[level],
        current: Math.min(slotInfo.max, (slotInfo.current || 0) + 1)
      };
    }
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };
  
  if (!character.spellSlots) {
    return null;
  }
  
  // Отображаем ячейки заклинаний по уровням
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ячейки заклинаний</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {Object.entries(character.spellSlots)
            .map(([level, slotInfo]) => {
              // Пропускаем уровень 0 (заговоры)
              if (level === '0') return null;
              
              const usedSlots = slotInfo.used;
              const maxSlots = slotInfo.max;
              
              // Отображаем и current, если он есть, иначе вычисляем из max и used
              const availableSlots = 'current' in slotInfo 
                ? slotInfo.current || maxSlots - usedSlots 
                : maxSlots - usedSlots;
              
              return (
                <div key={level} className="flex justify-between items-center">
                  <span>{level}-й уровень:</span>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => useSpellSlot(Number(level))}
                      disabled={availableSlots <= 0}
                    >
                      -
                    </Button>
                    <span className="mx-2 font-bold min-w-[50px] text-center">
                      {availableSlots}/{maxSlots}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => restoreSpellSlot(Number(level))}
                      disabled={usedSlots <= 0}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellSlotsPanel;
