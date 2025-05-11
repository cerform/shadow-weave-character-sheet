
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { getSpellLevelName } from '@/utils/spellHelpers';
import { CircleDot, CircleDotDashed, Plus, Minus } from 'lucide-react';

interface SpellSlotsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({
  character,
  onUpdate
}) => {
  const { toast } = useToast();

  // Обработчик использования ячейки заклинания
  const useSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used >= slotInfo.max) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1,
      current: slotInfo.current !== undefined ? slotInfo.current - 1 : slotInfo.max - slotInfo.used - 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Ячейка использована",
      description: `Использована ячейка заклинания ${level} уровня`,
    });
  };

  // Обработчик восстановления ячейки заклинания
  const restoreSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used <= 0) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1,
      current: slotInfo.current !== undefined ? slotInfo.current + 1 : slotInfo.max - slotInfo.used + 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Ячейка восстановлена",
      description: `Восстановлена ячейка заклинания ${level} уровня`,
    });
  };

  // Проверка наличия ячеек заклинаний у персонажа
  const hasSpellSlots = character.spellSlots && Object.keys(character.spellSlots).length > 0;

  if (!hasSpellSlots) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Нет доступных ячеек заклинаний
        </CardContent>
      </Card>
    );
  }

  // Количество доступных уровней ячеек
  const availableLevels = Object.keys(character.spellSlots)
    .map(level => parseInt(level))
    .sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ячейки заклинаний</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {availableLevels.map(level => {
            if (level === 0) return null; // Пропускаем заговоры
            
            const slotInfo = character.spellSlots![level];
            const available = slotInfo.max - slotInfo.used;
            const displayCurrent = slotInfo.current !== undefined ? slotInfo.current : available;
            
            return (
              <div key={`spell-slot-${level}`} className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{getSpellLevelName(level)}</span>
                  <div className="text-xs text-muted-foreground">
                    {displayCurrent} из {slotInfo.max} доступно
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => useSpellSlot(level)}
                    disabled={slotInfo.used >= slotInfo.max}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-1 min-w-[80px] justify-center">
                    {Array.from({ length: slotInfo.max }).map((_, i) => (
                      <span key={i}>
                        {i < slotInfo.used ? (
                          <CircleDotDashed className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <CircleDot className="h-4 w-4 text-primary" />
                        )}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => restoreSpellSlot(level)}
                    disabled={slotInfo.used <= 0}
                  >
                    <Plus className="h-4 w-4" />
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
