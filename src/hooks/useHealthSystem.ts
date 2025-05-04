
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface HealthEvent {
  id: string;
  type: 'damage' | 'heal' | 'temp' | 'rest-short' | 'rest-long' | 'level-up' | 'level-down';
  amount: number;
  source?: string;
  timestamp: Date;
}

interface HealthState {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  events: HealthEvent[];
}

export interface UseHealthSystemProps {
  initialCurrentHp: number;
  initialMaxHp: number;
  initialTempHp?: number;
  constitutionModifier: number;
  onHealthChange?: (currentHp: number, maxHp: number, tempHp: number) => void;
  logLimit?: number;
}

export function useHealthSystem({
  initialCurrentHp,
  initialMaxHp,
  initialTempHp = 0,
  constitutionModifier,
  onHealthChange,
  logLimit = 15
}: UseHealthSystemProps) {
  // Основное состояние здоровья
  const [health, setHealth] = useState<HealthState>({
    currentHp: initialCurrentHp,
    maxHp: initialMaxHp,
    tempHp: initialTempHp,
    events: []
  });
  
  // Состояние для отслеживания анимаций и всплывающих уведомлений
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isDamaging, setIsDamaging] = useState(false);
  
  // Рефы для предотвращения лишних обновлений
  const isInitialized = useRef(false);
  const notificationCooldown = useRef(false);
  const notificationQueue = useRef<Array<{title: string, description: string, variant?: "default" | "destructive"}>>([]);
  const notificationTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Обработка изменения здоровья для уведомления внешних компонентов
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    onHealthChange?.(health.currentHp, health.maxHp, health.tempHp);
  }, [health.currentHp, health.maxHp, health.tempHp, onHealthChange]);

  // Функция для добавления событий в лог с ограничением количества
  const addEventToLog = useCallback((event: Omit<HealthEvent, 'id' | 'timestamp'>) => {
    const newEvent: HealthEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setHealth(prev => ({
      ...prev,
      events: [newEvent, ...prev.events.slice(0, logLimit - 1)]
    }));
    
    return newEvent.id;
  }, [logLimit]);

  // Функция для показа уведомлений с предотвращением спама
  const enqueueNotification = useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    notificationQueue.current.push({ title, description, variant });
    
    if (!notificationCooldown.current) {
      processNotificationQueue();
    }
  }, []);
  
  // Обработчик очереди уведомлений
  const processNotificationQueue = useCallback(() => {
    if (notificationQueue.current.length === 0) {
      notificationCooldown.current = false;
      return;
    }
    
    notificationCooldown.current = true;
    const { title, description, variant } = notificationQueue.current.shift()!;
    
    toast({
      title,
      description,
      variant
    });
    
    // Устанавливаем таймер для следующего уведомления
    notificationTimer.current = setTimeout(() => {
      processNotificationQueue();
    }, 1500);
  }, [toast]);
  
  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, []);

  // Функция для получения урона
  const applyDamage = useCallback((amount: number, source?: string, silent: boolean = false) => {
    if (amount <= 0) return;

    setIsDamaging(true);
    setTimeout(() => setIsDamaging(false), 600);
    
    setHealth(prev => {
      // Сначала вычитаем из временных HP
      let remainingDamage = amount;
      let newTempHp = prev.tempHp;
      
      if (prev.tempHp > 0) {
        const absorbedByTemp = Math.min(prev.tempHp, amount);
        newTempHp -= absorbedByTemp;
        remainingDamage -= absorbedByTemp;
        
        if (absorbedByTemp > 0 && !silent) {
          addEventToLog({
            type: 'damage',
            amount: absorbedByTemp,
            source: 'Временные HP'
          });
        }
      }
      
      // Затем вычитаем из основных HP
      const newCurrentHp = Math.max(0, prev.currentHp - remainingDamage);
      
      // Добавляем событие в лог, если не в тихом режиме
      if (remainingDamage > 0 && !silent) {
        addEventToLog({
          type: 'damage',
          amount: remainingDamage,
          source
        });
        
        // Уведомления о статусе персонажа
        if (newCurrentHp === 0) {
          enqueueNotification(
            "Персонаж без сознания!", 
            `HP снижено до 0${source ? ` от ${source}` : ''}`,
            "destructive"
          );
        } else if (!silent) {
          enqueueNotification(
            "Урон получен", 
            `${amount} урона${source ? ` от ${source}` : ''}`,
            "destructive"
          );
        }
      }
      
      return {
        ...prev,
        currentHp: newCurrentHp,
        tempHp: newTempHp
      };
    });
  }, [addEventToLog, enqueueNotification]);

  // Функция для лечения
  const applyHealing = useCallback((amount: number, source?: string, silent: boolean = false) => {
    if (amount <= 0) return;

    setIsHealing(true);
    setTimeout(() => setIsHealing(false), 600);
    
    setHealth(prev => {
      const wasUnconscious = prev.currentHp === 0;
      const newCurrentHp = Math.min(prev.maxHp, prev.currentHp + amount);
      
      // Добавляем событие в лог, если не в тихом режиме
      if (!silent) {
        addEventToLog({
          type: 'heal',
          amount,
          source
        });
        
        if (wasUnconscious && newCurrentHp > 0) {
          enqueueNotification(
            "Персонаж пришел в сознание!",
            `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
            "default"
          );
        } else if (!silent) {
          enqueueNotification(
            "Лечение получено",
            `Восстановлено ${amount} HP${source ? ` от ${source}` : ''}`,
            "default"
          );
        }
      }
      
      return {
        ...prev,
        currentHp: newCurrentHp
      };
    });
  }, [addEventToLog, enqueueNotification]);

  // Функция для добавления временных HP
  const addTempHp = useCallback((amount: number, source?: string, silent: boolean = false) => {
    if (amount <= 0) return;

    setHealth(prev => {
      // Временные HP не складываются, берем наибольшее значение
      if (amount > prev.tempHp) {
        if (!silent) {
          addEventToLog({
            type: 'temp',
            amount,
            source
          });
          
          enqueueNotification(
            "Временные HP получены",
            `${amount} временных HP${source ? ` от ${source}` : ''}`,
            "default"
          );
        }
        
        return {
          ...prev,
          tempHp: amount
        };
      }
      return prev;
    });
  }, [addEventToLog, enqueueNotification]);

  // Функция для короткого отдыха
  const takeShortRest = useCallback((hitDieValue: number, useHitDie: boolean = false) => {
    setHealth(prev => {
      let healingAmount = 0;
      
      // При использовании Hit Die
      if (useHitDie) {
        // Среднее значение кубика + модификатор телосложения
        healingAmount = Math.floor(hitDieValue / 2) + 1 + constitutionModifier;
      } else {
        // Только малое восстановление без Hit Die
        healingAmount = Math.max(1, constitutionModifier);
      }
      
      const newCurrentHp = Math.min(prev.maxHp, prev.currentHp + healingAmount);
      
      addEventToLog({
        type: 'rest-short',
        amount: healingAmount,
        source: useHitDie ? 'Hit Die' : 'Короткий отдых'
      });
      
      enqueueNotification(
        "Короткий отдых завершен",
        `Восстановлено ${healingAmount} HP${useHitDie ? ' (использован Hit Die)' : ''}`,
        "default"
      );
      
      return {
        ...prev,
        currentHp: newCurrentHp
      };
    });
  }, [addEventToLog, constitutionModifier, enqueueNotification]);

  // Функция для длинного отдыха
  const takeLongRest = useCallback(() => {
    setHealth(prev => {
      addEventToLog({
        type: 'rest-long',
        amount: prev.maxHp - prev.currentHp,
        source: 'Длинный отдых'
      });
      
      enqueueNotification(
        "Длинный отдых завершен",
        "Здоровье полностью восстановлено",
        "default"
      );
      
      return {
        ...prev,
        currentHp: prev.maxHp,
        tempHp: 0 // Сбрасываем временные HP после длинного отдыха
      };
    });
  }, [addEventToLog, enqueueNotification]);

  // Функция для изменения максимальных HP при повышении уровня
  const updateMaxHp = useCallback((newMaxHp: number, reason?: string) => {
    setHealth(prev => {
      const hpDifference = newMaxHp - prev.maxHp;
      
      if (hpDifference !== 0) {
        const eventType = hpDifference > 0 ? 'level-up' : 'level-down';
        
        addEventToLog({
          type: eventType,
          amount: Math.abs(hpDifference),
          source: reason || (hpDifference > 0 ? 'Повышение уровня' : 'Понижение уровня')
        });
        
        if (hpDifference > 0) {
          enqueueNotification(
            "Максимальные HP увеличены",
            `+${hpDifference} макс. HP${reason ? ` (${reason})` : ''}`,
            "default"
          );
        } else {
          enqueueNotification(
            "Максимальные HP уменьшены",
            `${hpDifference} макс. HP${reason ? ` (${reason})` : ''}`,
            "destructive"
          );
        }
      }
      
      // При повышении уровня также увеличиваем текущее HP
      const newCurrentHp = hpDifference > 0
        ? Math.min(prev.currentHp + hpDifference, newMaxHp)
        : Math.min(prev.currentHp, newMaxHp);
      
      return {
        ...prev,
        maxHp: newMaxHp,
        currentHp: newCurrentHp
      };
    });
  }, [addEventToLog, enqueueNotification]);

  // Функция для прямого обновления здоровья (админский режим)
  const setDirectHealth = useCallback((newCurrentHp: number, newMaxHp?: number, newTempHp?: number) => {
    setHealth(prev => {
      const updatedMaxHp = newMaxHp !== undefined ? newMaxHp : prev.maxHp;
      const safeCurrentHp = Math.min(Math.max(0, newCurrentHp), updatedMaxHp);
      const safeTempHp = newTempHp !== undefined ? Math.max(0, newTempHp) : prev.tempHp;
      
      return {
        ...prev,
        currentHp: safeCurrentHp,
        maxHp: updatedMaxHp,
        tempHp: safeTempHp
      };
    });
  }, []);

  // Отмена последнего события 
  const undoLastEvent = useCallback(() => {
    setHealth(prev => {
      if (prev.events.length === 0) return prev;
      
      const [lastEvent, ...remainingEvents] = prev.events;
      let newCurrentHp = prev.currentHp;
      let newMaxHp = prev.maxHp;
      let newTempHp = prev.tempHp;
      
      // Отменяем эффект последнего события
      switch (lastEvent.type) {
        case 'damage':
          newCurrentHp = Math.min(prev.maxHp, prev.currentHp + lastEvent.amount);
          break;
        case 'heal':
          newCurrentHp = Math.max(0, prev.currentHp - lastEvent.amount);
          break;
        case 'temp':
          // Ищем предыдущее состояние временных HP
          const prevTempEvent = remainingEvents.find(e => e.type === 'temp');
          newTempHp = prevTempEvent ? prevTempEvent.amount : 0;
          break;
        case 'rest-short':
          newCurrentHp = Math.max(0, prev.currentHp - lastEvent.amount);
          break;
        case 'rest-long':
          // Для длинного отдыха просто убираем разницу
          newCurrentHp = Math.max(0, prev.currentHp - lastEvent.amount);
          break;
        case 'level-up':
          newMaxHp = prev.maxHp - lastEvent.amount;
          newCurrentHp = Math.min(newCurrentHp, newMaxHp);
          break;
        case 'level-down':
          newMaxHp = prev.maxHp + lastEvent.amount;
          break;
      }
      
      enqueueNotification(
        "Отменено последнее событие",
        `${getEventDescription(lastEvent)}`,
        "default"
      );
      
      return {
        currentHp: newCurrentHp,
        maxHp: newMaxHp,
        tempHp: newTempHp,
        events: remainingEvents
      };
    });
  }, [enqueueNotification]);
  
  // Вспомогательная функция для получения описания события
  const getEventDescription = (event: HealthEvent): string => {
    switch (event.type) {
      case 'damage':
        return `Урон ${event.amount} от ${event.source || 'неизвестно'}`;
      case 'heal':
        return `Лечение ${event.amount} от ${event.source || 'неизвестно'}`;
      case 'temp':
        return `Временные HP ${event.amount}`;
      case 'rest-short':
        return `Короткий отдых (+${event.amount} HP)`;
      case 'rest-long':
        return `Длинный отдых (полное восстановление)`;
      case 'level-up':
        return `Повышение уровня (+${event.amount} макс. HP)`;
      case 'level-down':
        return `Понижение уровня (-${event.amount} макс. HP)`;
      default:
        return `Неизвестное событие`;
    }
  };

  return {
    // Текущие значения
    currentHp: health.currentHp,
    maxHp: health.maxHp,
    tempHp: health.tempHp,
    events: health.events,
    
    // Флаги состояния
    isAnimating,
    isHealing,
    isDamaging,
    
    // Методы изменения здоровья
    applyDamage,
    applyHealing,
    addTempHp,
    takeShortRest,
    takeLongRest,
    updateMaxHp,
    setDirectHealth,
    undoLastEvent
  };
}
