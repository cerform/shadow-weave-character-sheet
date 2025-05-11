
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { getSpellLevelName } from '@/utils/spellHelpers';
import { CircleDot, CircleDotDashed, Plus, Minus } from 'lucide-react';

interface SpellSlotsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();

  // Функция для использования ячейки заклинания
  const useSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used >= slotInfo.max) {
      toast({
        title: "Невозможно",
        description: "Все ячейки этого уровня уже использованы",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Ячейка использована",
      description: `Использована ячейка заклинания ${level} уровня`,
    });
  };

  // Функция для восстановления ячейки заклинания
  const restoreSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used <= 0) {
      toast({
        title: "Невозможно",
        description: "Все ячейки этого уровня уже восстановлены",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Ячейка восстановлена",
      description: `Восстановлена ячейка заклинания ${level} уровня`,
    });
  };

  // Функция для преобразования ячейки в очки колдовства (для чародеев)
  const convertSlotToSorceryPoints = (level: number) => {
    if (!character.class || character.class.toLowerCase() !== 'чародей' || !character.sorceryPoints) {
      toast({
        title: "Невозможно",
        description: "Только чародеи могут конвертировать ячейки в очки колдовства",
        variant: "destructive"
      });
      return;
    }
    
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used >= slotInfo.max) {
      toast({
        title: "Невозможно",
        description: "У вас нет доступных ячеек этого уровня",
        variant: "destructive"
      });
      return;
    }
    
    // Количество получаемых очков равно уровню ячейки
    const pointsGained = level;
    const maxPoints = character.sorceryPoints.max;
    const currentPoints = character.sorceryPoints.current;
    
    if (currentPoints + pointsGained > maxPoints) {
      toast({
        title: "Невозможно",
        description: `Вы не можете получить больше ${maxPoints} очков колдовства`,
        variant: "destructive"
      });
      return;
    }
    
    // Обновляем ячейки заклинаний и очки колдовства
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    const updatedSorceryPoints = {
      ...character.sorceryPoints,
      current: character.sorceryPoints.current + pointsGained
    };
    
    onUpdate({
      spellSlots: updatedSpellSlots,
      sorceryPoints: updatedSorceryPoints
    });
    
    toast({
      title: "Конвертация завершена",
      description: `Ячейка ${level} уровня преобразована в ${pointsGained} очков колдовства`,
    });
  };
  
  // Функция для создания ячейки из очков колдовства (для чародеев)
  const createSpellSlotFromSorceryPoints = (level: number) => {
    if (!character.class || character.class.toLowerCase() !== 'чародей' || !character.sorceryPoints) {
      toast({
        title: "Невозможно",
        description: "Только чародеи могут создавать ячейки из очков колдовства",
        variant: "destructive"
      });
      return;
    }
    
    // Стоимость в очках колдовства
    const cost = level;
    
    if (character.sorceryPoints.current < cost) {
      toast({
        title: "Недостаточно очков колдовства",
        description: `Для создания ячейки ${level} уровня требуется ${cost} очков`,
        variant: "destructive"
      });
      return;
    }
    
    // Обновляем ячейки заклинаний и очки колдовства
    const updatedSpellSlots = { ...character.spellSlots };
    if (!updatedSpellSlots[level]) {
      updatedSpellSlots[level] = { max: 1, used: 0 };
    } else {
      updatedSpellSlots[level] = {
        max: updatedSpellSlots[level].max + 1,
        used: updatedSpellSlots[level].used
      };
    }
    
    const updatedSorceryPoints = {
      ...character.sorceryPoints,
      current: character.sorceryPoints.current - cost
    };
    
    onUpdate({
      spellSlots: updatedSpellSlots,
      sorceryPoints: updatedSorceryPoints
    });
    
    toast({
      title: "Ячейка создана",
      description: `Создана дополнительная ячейка ${level} уровня за ${cost} очков колдовства`,
    });
  };
  
  // Создаем визуальное представление ячеек заклинаний
  const renderSpellSlots = () => {
    if (!character.spellSlots || Object.keys(character.spellSlots).length === 0) {
      return (
        <div className="text-center text-muted-foreground p-4">
          Нет доступных ячеек заклинаний
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {Object.entries(character.spellSlots)
          .sort(([levelA], [levelB]) => parseInt(levelA) - parseInt(levelB))
          .map(([levelStr, slotInfo]) => {
            const level = parseInt(levelStr);
            const { max, used } = slotInfo;
            const available = max - used;
            
            return (
              <div key={`spell-slot-${level}`} className="flex items-center justify-between">
                <div>
                  <span className="font-medium mr-2">{getSpellLevelName(level)}:</span>
                  <Badge variant="outline" className="text-xs">
                    {available}/{max}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    disabled={used >= max}
                    onClick={() => useSpellSlot(level)}
                    title="Использовать ячейку заклинания"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    disabled={used <= 0}
                    onClick={() => restoreSpellSlot(level)}
                    title="Восстановить ячейку заклинания"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  {/* Дополнительные действия для чародея */}
                  {character.class && character.class.toLowerCase() === 'чародей' && character.sorceryPoints && (
                    <>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-xs h-7"
                        disabled={used >= max}
                        onClick={() => convertSlotToSorceryPoints(level)}
                        title="Преобразовать ячейку в очки колдовства"
                      >
                        → ОК
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-xs h-7"
                        disabled={character.sorceryPoints.current < level}
                        onClick={() => createSpellSlotFromSorceryPoints(level)}
                        title="Создать ячейку из очков колдовства"
                      >
                        ОК →
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
        })}
      </div>
    );
  };
  
  // Визуальное представление использованных/доступных ячеек
  const renderVisualSlots = () => {
    if (!character.spellSlots || Object.keys(character.spellSlots).length === 0) {
      return null;
    }
    
    return (
      <div className="grid grid-cols-1 gap-y-2 mt-3">
        {Object.entries(character.spellSlots)
          .sort(([levelA], [levelB]) => parseInt(levelA) - parseInt(levelB))
          .map(([levelStr, slotInfo]) => {
            const level = parseInt(levelStr);
            const { max, used } = slotInfo;
            
            return (
              <div key={`visual-slots-${level}`} className="flex flex-wrap items-center gap-1">
                <div className="w-10 text-xs font-medium">{level}-й:</div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: max }).map((_, i) => (
                    <div 
                      key={`slot-${level}-${i}`}
                      className="relative cursor-pointer"
                      onClick={() => i < (max - used) ? useSpellSlot(level) : restoreSpellSlot(level)}
                    >
                      {i < (max - used) ? (
                        <CircleDot className="h-5 w-5 text-purple-500" />
                      ) : (
                        <CircleDotDashed className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ячейки заклинаний</CardTitle>
      </CardHeader>
      <CardContent>
        {renderSpellSlots()}
        {renderVisualSlots()}
      </CardContent>
    </Card>
  );
};
