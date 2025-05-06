import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

interface SpellSlotsPopoverProps {
  level: number;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellSlotsPopover: React.FC<SpellSlotsPopoverProps> = ({
  level,
  character,
  onUpdate
}) => {
  const { toast } = useToast();
  
  const slotInfo = character.spellSlots?.[level] || { max: 0, used: 0 };
  const availableSlots = slotInfo.max - slotInfo.used;
  
  // Функция для использования слота заклинания
  const useSpellSlot = () => {
    if (!character.spellSlots || !character.spellSlots[level]) {
      toast({
        title: "Ошибка",
        description: "Слоты заклинаний не определены",
        variant: "destructive"
      });
      return;
    }
    
    if (slotInfo.used >= slotInfo.max) {
      toast({
        title: "Невозможно использовать слот",
        description: "Все слоты этого уровня уже использованы",
        variant: "destructive"
      });
      return;
    }
    
    const newSpellSlots = { ...character.spellSlots };
    newSpellSlots[level] = { ...slotInfo, used: slotInfo.used + 1 };
    
    onUpdate({ spellSlots: newSpellSlots });
    
    toast({
      title: "Слот использован",
      description: `Использован слот заклинания ${level}-го уровня`
    });
  };
  
  // Функция для восстановления слота заклинания
  const restoreSpellSlot = () => {
    if (!character.spellSlots || !character.spellSlots[level]) {
      toast({
        title: "Ошибка",
        description: "Слоты заклинаний не определены",
        variant: "destructive"
      });
      return;
    }
    
    if (slotInfo.used <= 0) {
      toast({
        title: "Невозможно восстановить слот",
        description: "Все слоты этого уровня уже восстановлены",
        variant: "destructive"
      });
      return;
    }
    
    const newSpellSlots = { ...character.spellSlots };
    newSpellSlots[level] = { ...slotInfo, used: slotInfo.used - 1 };
    
    onUpdate({ spellSlots: newSpellSlots });
    
    toast({
      title: "Слот восстановлен",
      description: `Восстановлен слот заклинания ${level}-го уровня`
    });
  };
  
  // Обмен очков колдовства на слоты (только для чародеев)
  const createSpellSlotFromSorceryPoints = () => {
    if (character.class !== "Чародей" || !character.sorceryPoints) {
      toast({
        title: "Невозможно",
        description: "Только чародеи могут создавать слоты из очков колдовства",
        variant: "destructive"
      });
      return;
    }
    
    // Стоимость создания слота в очках колдовства
    const pointCost = level;
    
    if (character.sorceryPoints.current < pointCost) {
      toast({
        title: "Недостаточно очков колдовства",
        description: `Требуется ${pointCost} очков, доступно ${character.sorceryPoints.current}`,
        variant: "destructive"
      });
      return;
    }
    
    // Создаем слот
    const newSpellSlots = { ...character.spellSlots };
    const newSorceryPoints = { 
      ...character.sorceryPoints, 
      current: character.sorceryPoints.current - pointCost 
    };
    
    // Увеличиваем максимальное количество слотов на 1
    newSpellSlots[level] = { 
      max: slotInfo.max + 1, 
      used: slotInfo.used 
    };
    
    onUpdate({ 
      spellSlots: newSpellSlots,
      sorceryPoints: newSorceryPoints
    });
    
    toast({
      title: "Слот создан",
      description: `Создан дополнительный слот ${level}-го уровня за ${pointCost} очков колдовства`
    });
  };
  
  // Конвертация слотов заклинаний в очки колдовства (только для чародеев)
  const convertSpellSlotToSorceryPoints = () => {
    if (character.class !== "Чародей" || !character.sorceryPoints) {
      toast({
        title: "Невозможно",
        description: "Только чародеи могут превращать слоты в очки колдовства",
        variant: "destructive"
      });
      return;
    }
    
    if (!character.spellSlots || !character.spellSlots[level]) {
      toast({
        title: "Ошибка",
        description: "Слоты заклинаний не определены",
        variant: "destructive"
      });
      return;
    }
    
    if (slotInfo.used >= slotInfo.max || slotInfo.max <= 0) {
      toast({
        title: "Невозможно конвертировать слот",
        description: "Нет доступных слотов этого уровня",
        variant: "destructive"
      });
      return;
    }
    
    // Количество получаемых очков колдовства равно уровню слота
    const gainedPoints = level;
    
    const newSpellSlots = { ...character.spellSlots };
    const newSorceryPoints = { 
      ...character.sorceryPoints, 
      current: Math.min(character.sorceryPoints.max, character.sorceryPoints.current + gainedPoints) 
    };
    
    // Используем слот заклинания
    newSpellSlots[level] = { 
      ...slotInfo, 
      used: slotInfo.used + 1 
    };
    
    onUpdate({ 
      spellSlots: newSpellSlots,
      sorceryPoints: newSorceryPoints
    });
    
    toast({
      title: "Слот конвертирован",
      description: `Получено ${gainedPoints} очков колдовства за слот ${level}-го уровня`
    });
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3" side="right">
        <div className="space-y-3">
          <h4 className="font-medium text-center">Слоты {level}-го уровня</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Доступно: {availableSlots}/{slotInfo.max}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={useSpellSlot}
              disabled={availableSlots <= 0}
            >
              Использовать
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={restoreSpellSlot}
              disabled={slotInfo.used <= 0}
            >
              Восстановить
            </Button>
          </div>
          
          {/* Опции только для чародеев */}
          {character.class === "Чародей" && character.sorceryPoints && (
            <>
              <div className="pt-2 border-t">
                <h5 className="text-sm font-medium text-center mb-2">Метамагия</h5>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={createSpellSlotFromSorceryPoints}
                    disabled={character.sorceryPoints.current < level}
                  >
                    Создать слот ({level} ОК)
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={convertSpellSlotToSorceryPoints}
                    disabled={availableSlots <= 0}
                  >
                    Слот → {level} ОК
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Очки колдовства: {character.sorceryPoints.current}/{character.sorceryPoints.max}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
