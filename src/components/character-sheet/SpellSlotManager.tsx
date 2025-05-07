import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SpellSlotManagerProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  showTitle?: boolean;
}

const SpellSlotManager = ({ character, onUpdate, showTitle = true }: SpellSlotManagerProps) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Record<number, { max: number; used: number; }>>({});

  useEffect(() => {
    if (character.spellSlots) {
      // Convert any variant of spell slots to standardized format
      const standardizedSlots: Record<number, { max: number; used: number }> = {};
      
      Object.entries(character.spellSlots).forEach(([level, slotData]) => {
        const numLevel = parseInt(level);
        if (isNaN(numLevel)) return;
        
        // Handle different formats of spell slot data
        if ('max' in slotData) {
          standardizedSlots[numLevel] = {
            max: slotData.max,
            used: slotData.used
          };
        } else if ('available' in slotData) {
          // Convert 'available' format to 'max'
          standardizedSlots[numLevel] = {
            max: 'max' in slotData ? slotData.max : slotData.available,
            used: slotData.used
          };
        }
      });
      
      setSlots(standardizedSlots);
    } else {
      // If no spell slots, initialize with defaults based on class and level
      initializeSpellSlots();
    }
  }, [character.spellSlots, character.class, character.level]);

  const initializeSpellSlots = () => {
    // Default spell slots based on class and level
    const defaultSlots: Record<number, { max: number; used: number }> = {};
    const maxSlotLevel = getMaxSpellSlotLevel(character.class || '', character.level || 1);
    
    for (let i = 1; i <= maxSlotLevel; i++) {
      defaultSlots[i] = {
        max: getSlotsForLevel(character.class || '', character.level || 1, i),
        used: 0
      };
    }
    
    setSlots(defaultSlots);
    onUpdate({ spellSlots: defaultSlots });
  };

  const useSpellSlot = (level: number) => {
    if (!slots[level] || slots[level].used >= slots[level].max) return;
    
    const updatedSlots = {
      ...slots,
      [level]: {
        ...slots[level],
        used: slots[level].used + 1
      }
    };
    
    setSlots(updatedSlots);
    onUpdate({ spellSlots: updatedSlots });
  };

  const restoreSpellSlot = (level: number) => {
    if (!slots[level] || slots[level].used <= 0) return;
    
    const updatedSlots = {
      ...slots,
      [level]: {
        ...slots[level],
        used: slots[level].used - 1
      }
    };
    
    setSlots(updatedSlots);
    onUpdate({ spellSlots: updatedSlots });
  };

  const restoreAllSlots = () => {
    const restoredSlots = Object.entries(slots).reduce((acc, [level, slotData]) => {
      acc[parseInt(level)] = {
        ...slotData,
        used: 0
      };
      return acc;
    }, {} as Record<number, { max: number; used: number }>);
    
    setSlots(restoredSlots);
    onUpdate({ spellSlots: restoredSlots });
    
    toast({
      title: 'Ячейки заклинаний восстановлены',
      description: 'Все ячейки заклинаний были восстановлены.'
    });
  };

  // Helper function to get maximum spell slot level for class and level
  const getMaxSpellSlotLevel = (className: string, level: number): number => {
    const fullCasters = ['волшебник', 'чародей', 'колдун', 'бард', 'клерик', 'друид'];
    const halfCasters = ['паладин', 'следопыт'];
    
    if (fullCasters.includes(className.toLowerCase())) {
      if (level >= 17) return 9;
      if (level >= 15) return 8;
      if (level >= 13) return 7;
      if (level >= 11) return 6;
      if (level >= 9) return 5;
      if (level >= 7) return 4;
      if (level >= 5) return 3;
      if (level >= 3) return 2;
      return 1;
    } else if (halfCasters.includes(className.toLowerCase())) {
      if (level >= 17) return 5;
      if (level >= 13) return 4;
      if (level >= 9) return 3;
      if (level >= 5) return 2;
      if (level >= 2) return 1;
      return 0;
    } else {
      // Other classes don't have spell slots by default
      return 0;
    }
  };

  // Helper function to get number of slots for a given level
  const getSlotsForLevel = (className: string, charLevel: number, spellLevel: number): number => {
    // Basic D&D 5e spell slot table for full casters
    const fullCasterTable: Record<number, Record<number, number>> = {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    };
    
    // Half caster table (for paladins and rangers)
    const halfCasterTable: Record<number, Record<number, number>> = {
      2: { 1: 2 },
      3: { 1: 3 },
      5: { 1: 4, 2: 2 },
      7: { 1: 4, 2: 3 },
      9: { 1: 4, 2: 3, 3: 2 },
      11: { 1: 4, 2: 3, 3: 3 },
      13: { 1: 4, 2: 3, 3: 3, 4: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 2 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    };
    
    const fullCasters = ['волшебник', 'чародей', 'колдун', 'бард', 'клерик', 'друид'];
    const halfCasters = ['паладин', 'следопыт'];
    
    if (fullCasters.includes(className.toLowerCase())) {
      return fullCasterTable[charLevel]?.[spellLevel] || 0;
    } else if (halfCasters.includes(className.toLowerCase())) {
      return halfCasterTable[charLevel]?.[spellLevel] || 0;
    } else {
      return 0;
    }
  };

  if (Object.keys(slots).length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 bg-card/70 shadow-md">
      {showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Ячейки заклинаний</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={restoreAllSlots}
              className="h-7 w-7 p-0"
              title="Восстановить все ячейки заклинаний"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
          {Object.entries(slots).map(([level, slotData]) => {
            const spellLevel = parseInt(level);
            if (slotData.max === 0) return null;
            
            return (
              <div key={level} className="flex flex-col items-center">
                <div className="text-xs font-medium mb-1">
                  {spellLevel}
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={slotData.used <= 0} 
                    onClick={() => restoreSpellSlot(spellLevel)}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="text-sm font-medium w-10 text-center">
                    {slotData.max - slotData.used}/{slotData.max}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={slotData.used >= slotData.max} 
                    onClick={() => useSpellSlot(spellLevel)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
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

export default SpellSlotManager;
