
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

// Обновляем интерфейсы
interface SpellSlot {
  max: number;
  used: number;
}

interface SpellSlotManagerProps {
  spellSlots: Record<string, SpellSlot>;
  onUpdateSpellSlots: (newSlots: Record<string, SpellSlot>) => void;
}

export const SpellSlotManager: React.FC<SpellSlotManagerProps> = ({
  spellSlots,
  onUpdateSpellSlots,
}) => {
  // Обработчик использования слота заклинания
  const handleUseSlot = (level: string) => {
    const slot = spellSlots[level];
    if (!slot) return;

    // Проверяем, доступны ли слоты для использования
    const available = slot.max - slot.used;
    if (available <= 0) return;

    const newSlots = {
      ...spellSlots,
      [level]: {
        ...slot,
        used: slot.used + 1,
      },
    };

    onUpdateSpellSlots(newSlots);
  };

  // Обработчик восстановления слота заклинания
  const handleRestoreSlot = (level: string) => {
    const slot = spellSlots[level];
    if (!slot || slot.used <= 0) return;

    const newSlots = {
      ...spellSlots,
      [level]: {
        ...slot,
        used: slot.used - 1,
      },
    };

    onUpdateSpellSlots(newSlots);
  };

  // Если нет слотов заклинаний, покажем сообщение
  if (!spellSlots || Object.keys(spellSlots).length === 0) {
    return (
      <div className="text-center p-2 text-sm text-muted-foreground">
        Нет доступных ячеек заклинаний
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-sm mb-2">Ячейки заклинаний</h3>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(spellSlots)
          .filter(([level]) => level !== '0') // Исключаем заговоры
          .map(([level, slot]) => (
            <div 
              key={level}
              className="flex flex-col items-center p-2 border rounded-md"
            >
              <span className="text-xs font-medium">Ур. {level}</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleRestoreSlot(level)}
                  disabled={slot.used <= 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="text-sm font-medium">
                  {slot.max - slot.used}/{slot.max}
                </span>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleUseSlot(level)}
                  disabled={(slot.max - slot.used) <= 0}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SpellSlotManager;
