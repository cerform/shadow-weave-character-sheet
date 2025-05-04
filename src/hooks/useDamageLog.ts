
import { useState, useEffect } from 'react';
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

  // Применяем событие получения урона/лечения
  const applyDamage = (amount: number, source?: string) => {
    if (amount === 0) return;

    const eventId = crypto.randomUUID();
    
    if (amount < 0) {
      // Это урон
      const damage = Math.abs(amount);
      let remainingDamage = damage;
      
      // Если есть временные HP, сначала снимаем их
      if (tempHp > 0) {
        const absorbedByTemp = Math.min(tempHp, damage);
        setTempHp((prev) => prev - absorbedByTemp);
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
        setCurrentHp((prev) => Math.max(0, prev - remainingDamage));
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
        
        toast({
          title: "Урон получен",
          description: `${damage} урона${source ? ` от ${source}` : ''}`,
          variant: "destructive"
        });
      }
    } else {
      // Это лечение
      setCurrentHp((prev) => Math.min(maxHp, prev + amount));
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
      
      toast({
        title: "Лечение получено",
        description: `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
      });
    }
  };

  // Добавляем временные хиты
  const addTempHp = (amount: number, source?: string) => {
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
    }
  };

  // Отменяем последнее изменение HP
  const undoLastEvent = () => {
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
  };

  return {
    currentHp,
    tempHp,
    events,
    applyDamage,
    addTempHp,
    undoLastEvent,
    // Устанавливаем HP напрямую (для инициализации)
    setHp: (hp: number) => setCurrentHp(hp),
    setTempHp
  };
};
