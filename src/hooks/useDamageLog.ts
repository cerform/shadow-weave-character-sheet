
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Реф для отслеживания инициализации хука
  const isInitialized = useRef(false);
  // Реф для предотвращения дублирования уведомлений
  const notificationCooldown = useRef(false);

  // Обновляем значения HP и сообщаем наверх через колбэк
  useEffect(() => {
    // Предотвращаем повторные уведомления при первичной инициализации
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    // Вызываем колбэк без отображения уведомлений при начальной загрузке
    onHpChange(currentHp, tempHp);
  }, [currentHp, tempHp, onHpChange]);

  // Функция для показа уведомлений с предотвращением спама
  const showNotification = useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    // Проверяем, не в режиме кулдауна ли уведомления
    if (notificationCooldown.current) return;
    
    // Устанавливаем кулдаун на 500мс, чтобы предотвратить спам
    notificationCooldown.current = true;
    
    toast({
      title,
      description,
      variant
    });
    
    // Снимаем кулдаун через 500мс
    setTimeout(() => {
      notificationCooldown.current = false;
    }, 500);
  }, [toast]);

  // Применяем событие получения урона
  const applyDamage = useCallback((amount: number, source?: string) => {
    if (amount <= 0) {
      console.error("applyDamage должен вызываться с положительным значением для нанесения урона");
      return;
    }

    const eventId = crypto.randomUUID();
    const damageAmount = amount;
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
        showNotification(
          "Персонаж без сознания!", 
          `HP снижено до 0${source ? ` от ${source}` : ''}`,
          "destructive"
        );
      } else {
        showNotification(
          "Урон получен", 
          `${damageAmount} урона${source ? ` от ${source}` : ''}`,
          "destructive"
        );
      }
    }
  }, [currentHp, tempHp, showNotification]);

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
      showNotification(
        "Персонаж пришел в сознание!",
        `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
        "default"
      );
    } else {
      showNotification(
        "Лечение получено",
        `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
        "default"
      );
    }
  }, [currentHp, maxHp, showNotification]);

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
      
      showNotification(
        "Временные HP получены",
        `${amount} временных HP${source ? ` от ${source}` : ''}`,
        "default"
      );
    } else if (amount === tempHp) {
      showNotification(
        "Временные HP обновлены",
        `${amount} временных HP${source ? ` от ${source}` : ''}`,
        "default"
      );
    } else if (amount > 0) {
      showNotification(
        "Временные HP не изменились",
        `У вас уже ${tempHp} временных HP (больше чем ${amount})`,
        "default"
      );
    }
  }, [tempHp, showNotification]);

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
    
    showNotification(
      "Отменено последнее событие",
      `${lastEvent.type === 'damage' ? 'Урон' : lastEvent.type === 'heal' ? 'Лечение' : 'Временные HP'} ${lastEvent.amount}`,
      "default"
    );
  }, [events, maxHp, showNotification]);

  // Прямое обновление HP с отключением уведомлений
  const setHp = useCallback((hp: number, silent: boolean = false) => {
    const oldHp = currentHp;
    const newHp = Math.max(0, Math.min(maxHp, hp));
    
    setCurrentHp(newHp);
    
    // Если значение изменилось и не в тихом режиме, добавляем событие в журнал
    if (newHp !== oldHp && !silent) {
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
      
      if (difference > 0) {
        showNotification(
          "Здоровье изменено",
          `+${difference} HP (ручное изменение)`,
          "default"
        );
      } else if (difference < 0) {
        showNotification(
          "Здоровье изменено",
          `-${Math.abs(difference)} HP (ручное изменение)`,
          "destructive"
        );
      }
    }
  }, [currentHp, maxHp, showNotification]);
  
  // Прямое обновление временного HP
  const setTempHpValue = useCallback((hp: number, silent: boolean = false) => {
    const oldTempHp = tempHp;
    const newTempHp = Math.max(0, hp);
    
    setTempHp(newTempHp);
    
    // Если значение изменилось и не в тихом режиме, добавляем событие в журнал
    if (newTempHp !== oldTempHp && !silent) {
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
      
      if (newTempHp > oldTempHp) {
        showNotification(
          "Временные HP изменены",
          `Установлено ${newTempHp} временных HP`,
          "default"
        );
      } else {
        showNotification(
          "Временные HP изменены",
          `Установлено ${newTempHp} временных HP`,
          "default"
        );
      }
    }
  }, [tempHp, showNotification]);

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
