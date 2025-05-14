
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface SpellSlotsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({ character, onUpdate }) => {
  // Safe access to spell slots with fallbacks
  const spellSlots = character.spellSlots || {};
  
  // Update spell slots
  const updateSlot = (level: number, change: number) => {
    const currentValue = spellSlots[level]?.current || 0;
    const maxValue = spellSlots[level]?.max || 0;
    
    // Calculate new value, ensuring it stays within bounds
    const newValue = Math.max(0, Math.min(maxValue, currentValue + change));
    
    // Only update if there's a change
    if (newValue !== currentValue) {
      const updatedSlots = {
        ...spellSlots,
        [level]: {
          ...spellSlots[level],
          current: newValue
        }
      };
      
      onUpdate({
        spellSlots: updatedSlots
      });
    }
  };

  // Check if we have any spell slots
  const hasSpellSlots = Object.keys(spellSlots).length > 0;
  
  if (!hasSpellSlots) return null;

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3">Ячейки заклинаний</h3>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(spellSlots).map(([levelStr, slot]) => {
            const level = parseInt(levelStr);
            if (!slot || level === 0) return null; // Skip cantrips (level 0)
            
            const { current, max } = slot;
            if (!max) return null; // Skip if no max slots
            
            return (
              <div key={`spell-slot-${level}`} className="border border-primary/20 rounded-lg p-2 bg-black/30">
                <div className="text-center font-medium mb-1">
                  {level} уровень
                </div>
                
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => updateSlot(level, -1)}
                    disabled={current <= 0}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-xl font-bold">
                    {current}/{max}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => updateSlot(level, 1)}
                    disabled={current >= max}
                  >
                    <PlusCircle className="h-4 w-4" />
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
