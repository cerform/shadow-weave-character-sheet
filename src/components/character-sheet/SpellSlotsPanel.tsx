
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { Badge } from '@/components/ui/badge';

interface SpellSlotsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({ character, onUpdate }) => {
  const [restType, setRestType] = useState<'short' | 'long'>('long');
  
  // Обработчик использования ячейки заклинания
  const handleUseSpellSlot = (level: string) => {
    if (!character.spellSlots) return;
    
    const spellSlot = character.spellSlots[level];
    if (!spellSlot || spellSlot.used >= spellSlot.max) return;
    
    const updatedSpellSlots = {
      ...character.spellSlots,
      [level]: {
        ...spellSlot,
        used: spellSlot.used + 1,
        current: spellSlot.max - (spellSlot.used + 1)
      }
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };
  
  // Обработчик восстановления ячейки заклинания
  const handleRestoreSpellSlot = (level: string) => {
    if (!character.spellSlots) return;
    
    const spellSlot = character.spellSlots[level];
    if (!spellSlot || spellSlot.used <= 0) return;
    
    const updatedSpellSlots = {
      ...character.spellSlots,
      [level]: {
        ...spellSlot,
        used: spellSlot.used - 1,
        current: spellSlot.max - (spellSlot.used - 1)
      }
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };
  
  // Обработчик восстановления всех ячеек заклинания
  const handleRestoreAllSpellSlots = () => {
    if (!character.spellSlots) return;
    
    const updatedSpellSlots: Record<string, { max: number; used: number; current: number }> = {};
    
    // При коротком отдыхе восстанавливаем только определенные уровни
    if (restType === 'short') {
      // Восстанавливаем только ячейки, которые восстанавливаются при коротком отдыхе
      Object.keys(character.spellSlots).forEach(level => {
        // Для примера, допустим, что только колдун восстанавливает ячейки при коротком отдыхе
        if (character.class && character.class.toLowerCase() === 'колдун') {
          updatedSpellSlots[level] = {
            ...character.spellSlots![level],
            used: 0,
            current: character.spellSlots![level].max
          };
        } else {
          updatedSpellSlots[level] = character.spellSlots![level];
        }
      });
    } else {
      // При длинном отдыхе восстанавливаем все
      Object.keys(character.spellSlots).forEach(level => {
        updatedSpellSlots[level] = {
          ...character.spellSlots![level],
          used: 0,
          current: character.spellSlots![level].max
        };
      });
    }
    
    onUpdate({ spellSlots: updatedSpellSlots });
  };
  
  // Если у персонажа нет ячеек заклинаний, не показываем панель
  if (!character.spellSlots || Object.keys(character.spellSlots).length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Ячейки заклинаний</span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={restType === 'short' ? 'default' : 'outline'}
              onClick={() => setRestType('short')}
            >
              КО
            </Button>
            <Button 
              size="sm" 
              variant={restType === 'long' ? 'default' : 'outline'}
              onClick={() => setRestType('long')}
            >
              ДО
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(character.spellSlots).map(([level, slots]) => {
            // Safe access to current, defaulting to max - used
            const currentSlots = slots.current !== undefined ? slots.current : (slots.max - slots.used);
            
            return (
              <div key={level} className="flex flex-col items-center border rounded p-2">
                <span className="text-sm">{level} уровень</span>
                <div className="flex items-center gap-1 mt-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRestoreSpellSlot(level)}
                    disabled={slots.used <= 0}
                  >
                    +
                  </Button>
                  <Badge className="mx-1 py-1 px-3">
                    {currentSlots}/{slots.max}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUseSpellSlot(level)}
                    disabled={slots.used >= slots.max}
                  >
                    -
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Button 
          className="w-full mt-3" 
          onClick={handleRestoreAllSpellSlots}
        >
          Восстановить после {restType === 'short' ? 'короткого' : 'длинного'} отдыха
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpellSlotsPanel;
