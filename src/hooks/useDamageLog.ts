
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DamageEvent {
  id: string;
  type: 'damage' | 'heal' | 'temp';
  amount: number;
  source?: string;
  timestamp: Date;
}

export const useDamageLog = (
  initialHp: number,
  maxHp: number,
  onHpChange: (hp: number, tempHp: number) => void
) => {
  const [currentHp, setCurrentHp] = useState(initialHp);
  const [tempHp, setTempHp] = useState(0);
  const [events, setEvents] = useState<DamageEvent[]>([]);
  const { toast } = useToast();

  // Обновляем значения HP и сообщаем наверх через колбэк
  useEffect(() => {
    onHpChange(currentHp, tempHp);
  }, [currentHp, tempHp, onHpChange]);

  // Применяем событие получения урона
  const applyDamage = useCallback((amount: number, source?: string) => {
    if (amount <= 0) {
      console.error("applyDamage должен вызываться с положительным значением для нанесения урона");
      return;
    }

    const eventId = crypto.randomUUID();
    const damageAmount = amount; // Уже положительное число
    let remainingDamage = damageAmount;
    
    // Если есть временные HP, сначала снимаем их
    if (tempHp > 0) {
      const absorbedByTemp = Math.min(tempHp, damageAmount);
      setTempHp((prev) => Math.max(0, prev - absorbedByTemp));
      remainingDamage -= absorbedByTemp;
      
      if (absorbedByTemp > 0) {
        setEvents((prev) => [
          {
            id: eventId + "-temp",
            type: 'damage', 
            amount: absorbedByTemp,
            source: source || 'Временное HP',
            timestamp: new Date()
          },
          ...prev
        ]);
      }
    }
    
    // Если остался урон после временных HP
    if (remainingDamage > 0) {
      // Уменьшаем текущее HP, не допуская значений < 0
      setCurrentHp((prev) => Math.max(0, prev - remainingDamage));
      
      // Добавляем событие урона в лог
      setEvents((prev) => [
        {
          id: eventId,
          type: 'damage',
          amount: remainingDamage,
          source,
          timestamp: new Date()
        },
        ...prev
      ]);
      
      // Проверяем на статус "в сознании/без сознания"
      const newHp = Math.max(0, currentHp - remainingDamage);
      if (newHp === 0) {
        toast({
          title: "Персонаж без сознания!",
          description: `HP снижено до 0${source ? ` от ${source}` : ''}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Урон получен",
          description: `${damageAmount} урона${source ? ` от ${source}` : ''}`,
          variant: "destructive" 
        });
      }
    }
  }, [currentHp, tempHp, toast]);

  // Применяем событие получения лечения
  const applyHealing = useCallback((amount: number, source?: string) => {
    if (amount <= 0) {
      console.error("applyHealing должен вызываться с положительным значением для лечения");
      return;
    }

    const eventId = crypto.randomUUID();
    const wasUnconscious = currentHp === 0;
    const newHp = Math.min(maxHp, currentHp + amount);
    setCurrentHp(newHp);
    
    setEvents((prev) => [
      {
        id: eventId,
        type: 'heal',
        amount,
        source,
        timestamp: new Date()
      },
      ...prev
    ]);
    
    if (wasUnconscious && newHp > 0) {
      toast({
        title: "Персонаж пришел в сознание!",
        description: `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
        variant: "default"
      });
    } else {
      toast({
        title: "Лечение получено",
        description: `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
      });
    }
  }, [currentHp, maxHp, toast]);

  // Добавляем временные хиты
  const addTempHp = useCallback((amount: number, source?: string) => {
    // Временные хиты не складываются, берется наибольшее значение
    if (amount > tempHp) {
      setTempHp(amount);
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          type: 'temp',
          amount,
          source,
          timestamp: new Date()
        },
        ...prev
      ]);
      
      toast({
        title: "Временные HP получены",
        description: `${amount} временных HP${source ? ` от ${source}` : ''}`,
      });
    } else if (amount === tempHp) {
      toast({
        title: "Временные HP обновлены",
        description: `${amount} временных HP${source ? ` от ${source}` : ''}`,
      });
    } else {
      toast({
        title: "Временные HP не изменились",
        description: `У вас уже ${tempHp} временных HP (больше чем ${amount})`,
      });
    }
  }, [tempHp, toast]);

  // Отменяем последнее изменение HP
  const undoLastEvent = useCallback(() => {
    if (events.length === 0) return;
    
    const lastEvent = events[0];
    setEvents((prev) => prev.slice(1));
    
    // Отменяем эффект последнего события
    switch (lastEvent.type) {
      case 'damage':
        setCurrentHp((prev) => Math.min(maxHp, prev + lastEvent.amount));
        break;
      case 'heal':
        setCurrentHp((prev) => Math.max(0, prev - lastEvent.amount));
        break;
      case 'temp':
        // Находим предыдущее событие с временными хитами
        const prevTempEvent = events.slice(1).find(e => e.type === 'temp');
        setTempHp(prevTempEvent?.amount || 0);
        break;
    }
    
    toast({
      title: "Отменено последнее событие",
      description: `${lastEvent.type === 'damage' ? 'Урон' : lastEvent.type === 'heal' ? 'Лечение' : 'Временные HP'} ${lastEvent.amount}`,
    });
  }, [events, maxHp, toast]);

  // Прямое обновление HP (например, при загрузке персонажа или отдыхе)
  const setHp = useCallback((hp: number) => {
    const oldHp = currentHp;
    const newHp = Math.max(0, Math.min(maxHp, hp));
    
    setCurrentHp(newHp);
    
    // Если значение изменилось, добавляем событие в журнал
    if (newHp !== oldHp) {
      const difference = newHp - oldHp;
      
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          type: difference > 0 ? 'heal' : 'damage',
          amount: Math.abs(difference),
          source: 'Ручное изменение',
          timestamp: new Date()
        },
        ...prev
      ]);
    }
  }, [currentHp, maxHp]);
  
  // Прямое обновление временного HP
  const setTempHpValue = useCallback((hp: number) => {
    const oldTempHp = tempHp;
    const newTempHp = Math.max(0, hp);
    
    setTempHp(newTempHp);
    
    // Если значение изменилось, добавляем событие в журнал
    if (newTempHp !== oldTempHp) {
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          type: 'temp',
          amount: newTempHp,
          source: 'Ручное изменение',
          timestamp: new Date()
        },
        ...prev
      ]);
    }
  }, [tempHp]);

  return {
    currentHp,
    tempHp,
    events,
    applyDamage,
    applyHealing,
    addTempHp,
    undoLastEvent,
    setHp,
    setTempHp: setTempHpValue
  };
};
