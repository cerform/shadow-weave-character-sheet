
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';

interface SpellSlotManagerProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSlotManager: React.FC<SpellSlotManagerProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  
  // Обработчик изменения ячеек заклинаний
  const handleSpellSlotChange = (level: number, action: 'use' | 'recover') => {
    if (!character.spellSlots) return;
    
    const currentSpellSlots = character.spellSlots[level];
    if (!currentSpellSlots) return;
    
    if (action === 'use' && currentSpellSlots.used < currentSpellSlots.max) {
      onUpdate({
        spellSlots: {
          ...character.spellSlots,
          [level]: {
            ...currentSpellSlots,
            used: currentSpellSlots.used + 1
          }
        }
      });
      
      toast({
        title: `Ячейка заклинания ${level} уровня использована`,
        description: `Осталось ячеек: ${currentSpellSlots.max - (currentSpellSlots.used + 1)}`,
      });
    } else if (action === 'recover' && currentSpellSlots.used > 0) {
      onUpdate({
        spellSlots: {
          ...character.spellSlots,
          [level]: {
            ...currentSpellSlots,
            used: currentSpellSlots.used - 1
          }
        }
      });
      
      toast({
        title: `Ячейка заклинания ${level} уровня восстановлена`,
        description: `Осталось ячеек: ${currentSpellSlots.max - (currentSpellSlots.used - 1)}`,
      });
    }
  };

  // Если у персонажа нет ячеек заклинаний, не отображаем компонент
  if (!character.spellSlots || Object.keys(character.spellSlots).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ячейки заклинаний</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(character.spellSlots).map(([level, slots]) => (
            <div key={`spell-slot-${level}`} className="border p-2 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-sm">{level} уровень:</span>
                <span className="text-sm">{slots.max - slots.used}/{slots.max}</span>
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSpellSlotChange(Number(level), 'use')}
                  disabled={slots.used >= slots.max}
                  className="flex-1 p-1 h-7 text-xs"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSpellSlotChange(Number(level), 'recover')}
                  disabled={slots.used <= 0}
                  className="flex-1 p-1 h-7 text-xs"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Точки колдовства для чародея */}
        {character.sorceryPoints && (
          <div className="mt-4 border p-3 rounded">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Очки колдовства:</span>
              <span>{character.sorceryPoints.current}/{character.sorceryPoints.max}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (character.sorceryPoints && character.sorceryPoints.current > 0) {
                    onUpdate({
                      sorceryPoints: {
                        ...character.sorceryPoints,
                        current: character.sorceryPoints.current - 1
                      }
                    });
                  }
                }}
                disabled={!character.sorceryPoints || character.sorceryPoints.current <= 0}
                className="flex-1"
              >
                Использовать
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (character.sorceryPoints && character.sorceryPoints.current < character.sorceryPoints.max) {
                    onUpdate({
                      sorceryPoints: {
                        ...character.sorceryPoints,
                        current: character.sorceryPoints.current + 1
                      }
                    });
                  }
                }}
                disabled={!character.sorceryPoints || character.sorceryPoints.current >= character.sorceryPoints.max}
                className="flex-1"
              >
                Восстановить
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellSlotManager;
