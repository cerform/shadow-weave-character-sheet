import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getNumericModifier } from "@/utils/abilityScoreUtils";
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { getHitDieByClass } from '@/utils/classUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { HitPointEvent, Character } from '@/types/character';
import DamageLog from './DamageLog';

interface ResourcePanelProps {
  character: Character | null;
  onUpdate: (character: Partial<Character>) => void;
  isDM?: boolean;
}

export const ResourcePanel = ({ character, onUpdate, isDM = false }: ResourcePanelProps) => {
  const [currentHp, setCurrentHp] = useState(character?.currentHp || 0);
  const [maxHp, setMaxHp] = useState(character?.maxHp || 0);
  const [tempHp, setTempHp] = useState(character?.temporaryHp || 0);
  const [damageEvents, setDamageEvents] = useState<HitPointEvent[]>([]);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Получаем модификатор телосложения
  const constitution = character?.abilities?.constitution || character?.abilities?.CON || 10;
  
  useEffect(() => {
    if (character) {
      setCurrentHp(character.currentHp || 0);
      setMaxHp(character.maxHp || 0);
      setTempHp(character.temporaryHp || 0);
    }
  }, [character]);
  
  // Функция для применения урона или лечения
  const applyHpChange = (amount: number, type: 'damage' | 'healing' | 'tempHP') => {
    if (!character) return;
    
    let newHp = currentHp;
    let newTempHp = tempHp;
    
    if (type === 'damage') {
      if (newTempHp > 0) {
        const remainingTempHp = newTempHp - amount;
        if (remainingTempHp >= 0) {
          newTempHp = remainingTempHp;
        } else {
          newTempHp = 0;
          newHp += remainingTempHp; // remainingTempHp is negative here
        }
      } else {
        newHp -= amount;
      }
    } else if (type === 'healing') {
      newHp += amount;
      if (newHp > maxHp) {
        newHp = maxHp;
      }
    } else if (type === 'tempHP') {
      newTempHp += amount;
    }
    
    // Ensure currentHp does not exceed maxHp
    if (newHp > maxHp) {
      newHp = maxHp;
    }
    
    // Ensure currentHp is not less than 0
    if (newHp < 0) {
      newHp = 0;
    }
    
    // Обновляем состояние персонажа
    onUpdate({
      ...character,
      currentHp: newHp,
      temporaryHp: newTempHp
    });
    
    // Обновляем локальное состояние
    setCurrentHp(newHp);
    setTempHp(newTempHp);
    
    // Добавляем событие в лог
    const newEvent: HitPointEvent = {
      id: Math.random().toString(36).substring(2, 11),
      type: type,
      amount: amount,
      source: 'Ручное изменение',
      timestamp: new Date()
    };
    
    setDamageEvents(prev => [newEvent, ...prev].slice(0, 20));
    
    // Показываем сообщение пользователю
    toast({
      title: type === 'damage' ? "Урон" : type === 'healing' ? "Лечение" : "Временные хиты",
      description: `Вы ${type === 'damage' ? "получили" : type === 'healing' ? "восстановили" : "получили временные"} ${amount} хитов.`,
    });
  };

  // Функция для обработки результата броска кубов хитов
  const handleHitDieRollComplete = (result: number) => {
    if (!character) return;
    
    // Обрабатываем результат броска кубиков хитов
    const healingAmount = result;
    
    // Восстанавливаем хиты, но не больше максимального значения
    let newHp = (character.currentHp || 0) + healingAmount;
    const maxHp = character.maxHp || 0;
    
    if (newHp > maxHp) {
      newHp = maxHp;
    }
    
    // Обновляем состояние персонажа
    onUpdate({
      ...character,
      currentHp: newHp,
      hitDice: {
        ...character.hitDice,
        used: (character.hitDice?.used || 0) + 1
      }
    });
    
    // Добавляем событие в лог
    const newEvent: HitPointEvent = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'healing',
      amount: healingAmount,
      source: 'Кубики хитов',
      timestamp: new Date()
    };
    
    setDamageEvents(prev => [newEvent, ...prev].slice(0, 20));
    
    // Показываем сообщение пользователю
    toast({
      title: "Восстановление хитов",
      description: `Вы восстановили ${healingAmount} хитов, используя кубик хитов.`
    });
  };
  
  // Функция для использования кубика хитов
  const useHitDie = () => {
    if (!character) return;
    
    if ((character.hitDice?.used || 0) < (character.hitDice?.total || 0)) {
      // Запускаем бросок кубика хитов
      const roller = document.querySelector('.dice-roller-container');
      if (roller) {
        (roller as any).click();
      }
    } else {
      toast({
        title: "Кубики хитов закончились",
        description: "У вас не осталось доступных кубиков хитов для использования.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ресурсы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentHp">Текущие хиты</Label>
              <Input
                type="number"
                id="currentHp"
                value={currentHp}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setCurrentHp(value);
                  if (character) {
                    onUpdate({ ...character, currentHp: value });
                  }
                }}
                disabled={!isDM}
              />
            </div>
            <div>
              <Label htmlFor="maxHp">Максимальные хиты</Label>
              <Input
                type="number"
                id="maxHp"
                value={maxHp}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setMaxHp(value);
                  if (character) {
                    onUpdate({ ...character, maxHp: value });
                  }
                }}
                disabled={!isDM}
              />
            </div>
            <div>
              <Label htmlFor="tempHp">Временные хиты</Label>
              <Input
                type="number"
                id="tempHp"
                value={tempHp}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setTempHp(value);
                  if (character) {
                    onUpdate({ ...character, temporaryHp: value });
                  }
                }}
                disabled={!isDM}
              />
            </div>
          </div>
          
          <div className="flex justify-between gap-4">
            <Button onClick={() => applyHpChange(1, 'damage')} disabled={!isDM}>
              Получить урон
            </Button>
            <Button onClick={() => applyHpChange(1, 'healing')} disabled={!isDM}>
              Исцелиться
            </Button>
            <Button onClick={() => applyHpChange(1, 'tempHP')} disabled={!isDM}>
              Временные хиты
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-t-4 border-t-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Кубики хитов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalHitDice">Всего кубиков</Label>
              <Input
                type="text"
                id="totalHitDice"
                value={character?.hitDice?.total || 0}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="usedHitDice">Использовано кубиков</Label>
              <Input
                type="text"
                id="usedHitDice"
                value={character?.hitDice?.used || 0}
                disabled
              />
            </div>
          </div>
          <Button onClick={useHitDie}>
            Использовать кубик хитов
          </Button>
        </CardContent>
      </Card>
      
      <div className="dice-roller-container hidden">
        <DiceRoller3D
          initialDice={getHitDieByClass(character?.className)}
          hideControls={false}
          modifier={getNumericModifier(constitution)}
          onRollComplete={handleHitDieRollComplete}
          themeColor={currentTheme.accent}
        />
      </div>
      
      {/* Преобразуем события для совместимости с DamageLog */}
      <DamageLog 
        events={damageEvents.map(event => ({
          ...event,
          // Убедимся, что тип соответствует HitPointEvent из character.d.ts
          type: event.type === 'heal' ? 'healing' : 
                event.type === 'temp' ? 'tempHP' : event.type
        }))} 
      />
    </div>
  );
};

export default ResourcePanel;
