import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getNumericModifier } from '@/utils/characterUtils';

export interface HitPointEvent {
  id: string;
  type: 'damage' | 'heal' | 'temp' | 'death-save';
  amount: number;
  source?: string;
  timestamp: Date;
}

interface DeathSaves {
  successes: number;
  failures: number;
}

export interface UseHitPointsProps {
  currentHp: number;
  maxHp: number;
  temporaryHp?: number;
  constitution?: number;
  onHitPointChange?: (hp: number, tempHp: number, deathSaves?: DeathSaves) => void;
}

export function useHitPoints({
  currentHp: initialCurrentHp,
  maxHp: initialMaxHp,
  temporaryHp: initialTempHp = 0,
  constitution = 10,
  onHitPointChange
}: UseHitPointsProps) {
  const [currentHp, setCurrentHp] = useState(initialCurrentHp);
  const [maxHp, setMaxHp] = useState(initialMaxHp);
  const [tempHp, setTempHp] = useState(initialTempHp);
  const [events, setEvents] = useState<HitPointEvent[]>([]);
  const [deathSaves, setDeathSaves] = useState<DeathSaves>({ successes: 0, failures: 0 });
  const [isUnconscious, setIsUnconscious] = useState(initialCurrentHp <= 0);
  const { toast } = useToast();
  
  // Обновляем состояние, если props изменились
  useEffect(() => {
    setCurrentHp(initialCurrentHp);
    setMaxHp(initialMaxHp);
    setTempHp(initialTempHp);
    setIsUnconscious(initialCurrentHp <= 0);
  }, [initialCurrentHp, initialMaxHp, initialTempHp]);
  
  // Вызываем callback при изменении здоровья
  useEffect(() => {
    if (onHitPointChange) {
      onHitPointChange(currentHp, tempHp, deathSaves);
    }
  }, [currentHp, tempHp, deathSaves, onHitPointChange]);
  
  // Генерируем уникальный ID для событий
  const generateEventId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };
  
  // Применяем урон
  const applyDamage = (amount: number, source?: string) => {
    if (amount <= 0) return;
    
    const damageAmount = Math.abs(amount);
    let remainingDamage = damageAmount;
    const eventId = generateEventId();
    const wasUnconscious = currentHp <= 0;
    let tempEvents: HitPointEvent[] = [];
    
    // Если есть временные хиты, они поглощают урон
    if (tempHp > 0) {
      const absorbedByTemp = Math.min(tempHp, remainingDamage);
      const newTempHp = Math.max(0, tempHp - absorbedByTemp);
      setTempHp(newTempHp);
      remainingDamage -= absorbedByTemp;
      
      if (absorbedByTemp > 0) {
        tempEvents.push({
          id: eventId + "-temp",
          type: 'damage',
          amount: absorbedByTemp,
          source: source || "Временное HP",
          timestamp: new Date()
        });
      }
    }
    
    // Если остался урон после временных HP
    if (remainingDamage > 0) {
      const newHp = Math.max(0, currentHp - remainingDamage);
      setCurrentHp(newHp);
      
      // Добавляем событие урона
      tempEvents.push({
        id: eventId,
        type: 'damage',
        amount: remainingDamage,
        source,
        timestamp: new Date()
      });
      
      // Обработка бессознательного состояния
      if (newHp === 0 && currentHp > 0) {
        setIsUnconscious(true);
        
        toast({
          title: "Персонаж без сознания",
          description: `HP снизилось до 0${source ? ` от ${source}` : ''}`,
          variant: "destructive"
        });
      }
      // Проверка мгновенной смерти
      else if (wasUnconscious && remainingDamage >= maxHp) {
        setDeathSaves({ successes: 0, failures: 3 }); // Мгновенная смерть
        
        toast({
          title: "Критический урон!",
          description: "Персонаж получил урон, равный максимальным HP. Мгновенная смерть.",
          variant: "destructive"
        });
        
        tempEvents.push({
          id: eventId + "-death",
          type: 'death-save',
          amount: 3, // 3 проваленных спасброска = смерть
          source: "Мгновенная смерть от критического урона",
          timestamp: new Date()
        });
      }
      // Проваленный спасбросок от урона в бессознательном состоянии
      else if (wasUnconscious && remainingDamage > 0) {
        const newFailures = Math.min(deathSaves.failures + 1, 3);
        setDeathSaves({
          ...deathSaves,
          failures: newFailures
        });
        
        tempEvents.push({
          id: eventId + "-death-save",
          type: 'death-save',
          amount: 1,
          source: "Проваленный спасбросок от урона в бессознательном состоянии",
          timestamp: new Date()
        });
        
        if (newFailures >= 3) {
          toast({
            title: "Персонаж умирает!",
            description: "Получено 3 провала спасбросков от смерти",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Проваленный спасбросок от смерти",
            description: `Получено ${newFailures} из 3 провалов`,
            variant: "destructive"
          });
        }
      }
      else if (newHp > 0) {
        toast({
          title: "Урон получен",
          description: `${remainingDamage} урона${source ? ` от ${source}` : ''}`,
          variant: "destructive"
        });
      }
    }
    
    // Обновляем список событий
    setEvents(prev => [...tempEvents, ...prev]);
  };
  
  // Применяем лечение
  const applyHealing = (amount: number, source?: string) => {
    if (amount <= 0) return;
    
    const healingAmount = Math.abs(amount);
    const wasUnconscious = currentHp <= 0;
    
    // Лечение имеет эффект только если персонаж в бессознательном состоянии или не на максимальном здоровье
    if (wasUnconscious || currentHp < maxHp) {
      const newHp = Math.min(maxHp, currentHp + healingAmount);
      setCurrentHp(newHp);
      
      // Если персонаж приходит в сознание
      if (wasUnconscious && newHp > 0) {
        setIsUnconscious(false);
        setDeathSaves({ successes: 0, failures: 0 }); // Сброс спасбросков при приходе в сознание
        
        toast({
          title: "Персонаж пришел в сознание",
          description: `Восстановлено ${healingAmount} HP${source ? ` от ${source}` : ''}`,
        });
      } else {
        toast({
          title: "Лечение получено",
          description: `Восстановлено ${healingAmount} HP${source ? ` от ${source}` : ''}`,
        });
      }
      
      // Добавляем событие лечения
      setEvents(prev => [{
        id: generateEventId(),
        type: 'heal',
        amount: healingAmount,
        source,
        timestamp: new Date()
      }, ...prev]);
    } else {
      // Если персонаж уже на максиму��е здоровья
      toast({
        title: "Лечение невозможно",
        description: "Персонаж уже имеет максимальное количество HP",
      });
    }
  };
  
  // Устанавливаем временные хиты
  const setTemporaryHp = (amount: number, source?: string) => {
    if (amount < 0) return;
    
    // Временные хиты не суммируются, используется наибольшее значение
    if (amount > tempHp) {
      setTempHp(amount);
      
      toast({
        title: "Временные HP получены",
        description: `${amount} временных HP${source ? ` от ${source}` : ''}`,
      });
      
      setEvents(prev => [{
        id: generateEventId(),
        type: 'temp',
        amount,
        source,
        timestamp: new Date()
      }, ...prev]);
    } else if (amount === tempHp && amount > 0) {
      toast({
        title: "Временные HP обновлены",
        description: `${amount} временных HP${source ? ` от ${source}` : ''}`,
      });
    }
  };
  
  // Выполняем спасбросок от смерти
  const rollDeathSave = (result: number) => {
    const criticalSuccess = result === 20;
    const criticalFailure = result === 1;
    const success = result >= 10 || criticalSuccess;
    
    if (criticalSuccess) {
      // Критический успех: персонаж приходит в сознание с 1 HP
      setCurrentHp(1);
      setIsUnconscious(false);
      setDeathSaves({ successes: 0, failures: 0 });
      
      toast({
        title: "Критический успех!",
        description: "Персонаж приходит в сознание с 1 HP",
      });
      
      setEvents(prev => [{
        id: generateEventId(),
        type: 'heal',
        amount: 1,
        source: "Критический успех при спасброске от смерти",
        timestamp: new Date()
      }, ...prev]);
    } else if (criticalFailure) {
      // Критическая неудача: 2 провала
      const newFailures = Math.min(deathSaves.failures + 2, 3);
      setDeathSaves({
        ...deathSaves,
        failures: newFailures
      });
      
      if (newFailures >= 3) {
        toast({
          title: "Критическая неудача!",
          description: "Персонаж умирает. Получено 3 провала спасбросков от смерти",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Критическая неудача!",
          description: `Получено 2 провала (всего ${newFailures} из 3)`,
          variant: "destructive"
        });
      }
      
      setEvents(prev => [{
        id: generateEventId(),
        type: 'death-save',
        amount: 2,
        source: "Критическая неудача при спасброске от смерти",
        timestamp: new Date()
      }, ...prev]);
    } else if (success) {
      // Обычный успех
      const newSuccesses = Math.min(deathSaves.successes + 1, 3);
      setDeathSaves({
        ...deathSaves,
        successes: newSuccesses
      });
      
      if (newSuccesses >= 3) {
        toast({
          title: "Стабилизация!",
          description: "Персонаж стабилизирован. Получено 3 успешных спасброска от смерти",
        });
      } else {
        toast({
          title: "Успешный спасбросок",
          description: `Получено ${newSuccesses} из 3 успехов`,
        });
      }
      
      setEvents(prev => [{
        id: generateEventId(),
        type: 'death-save',
        amount: 1,
        source: "Успешный спасбросок от смерти",
        timestamp: new Date()
      }, ...prev]);
    } else {
      // Обычная неудача
      const newFailures = Math.min(deathSaves.failures + 1, 3);
      setDeathSaves({
        ...deathSaves,
        failures: newFailures
      });
      
      if (newFailures >= 3) {
        toast({
          title: "Персонаж умирает!",
          description: "Получено 3 провала спасбросков от смерти",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Проваленный спасбросок",
          description: `Получено ${newFailures} из 3 провалов`,
          variant: "destructive"
        });
      }
      
      setEvents(prev => [{
        id: generateEventId(),
        type: 'death-save',
        amount: 1,
        source: "Проваленный спасбросок от смерти",
        timestamp: new Date()
      }, ...prev]);
    }
  };
  
  // Отменить последнее событие
  const undoLastEvent = () => {
    if (events.length === 0) return;
    
    const lastEvent = events[0];
    setEvents(prev => prev.slice(1));
    
    switch (lastEvent.type) {
      case 'damage':
        setCurrentHp(prev => Math.min(maxHp, prev + lastEvent.amount));
        break;
      case 'heal':
        setCurrentHp(prev => Math.max(0, prev - lastEvent.amount));
        break;
      case 'temp':
        // Находим предыдущее событие с временными хитами
        const prevTempEvent = events.slice(1).find(e => e.type === 'temp');
        setTempHp(prevTempEvent?.amount || 0);
        break;
      case 'death-save':
        // Сложнее отменить спасброски, упрощённая логика
        if (lastEvent.source?.includes("Критический успех")) {
          setCurrentHp(0);
          setIsUnconscious(true);
        }
        setDeathSaves({ successes: 0, failures: 0 });
        break;
    }
    
    toast({
      title: "Отменено последнее событие",
      description: `${lastEvent.type === 'damage' ? 'Урон' : 
                    lastEvent.type === 'heal' ? 'Лечение' : 
                    lastEvent.type === 'temp' ? 'Временные HP' : 
                    'Спасбросок от смерти'} ${lastEvent.amount}`,
    });
  };
  
  // Восстановление здоровья через Hit Die
  const rollHitDieHealing = (hitDieValue: number) => {
    const constitutionMod = getNumericModifier(constitution);
    const healingAmount = Math.max(1, hitDieValue + constitutionMod);
    applyHealing(healingAmount, "Hit Die");
    
    return healingAmount;
  };
  
  // Короткий отдых
  const shortRest = (hitDiceToUse: number = 0) => {
    if (hitDiceToUse > 0) {
      const constitutionMod = getNumericModifier(constitution);
      const averageHitDieValue = 4.5; // Среднее между 1 и 8 (для d8)
      const estimatedHealingAmount = Math.max(1, Math.floor(hitDiceToUse * (averageHitDieValue + constitutionMod)));
      
      applyHealing(estimatedHealingAmount, "Короткий отдых");
      
      toast({
        title: "Короткий отдых завершен",
        description: `Восстановлено ${hitDiceToUse} Hit Dice и ${estimatedHealingAmount} HP`,
      });
    } else {
      toast({
        title: "Короткий отдых завершен",
        description: "Отдых без использования Hit Dice",
      });
    }
  };
  
  // Длинный отдых
  const longRest = () => {
    const wasUnconscious = currentHp <= 0;
    setCurrentHp(maxHp);
    setTempHp(0); // Временные хиты сбрасываются после отдыха
    
    if (wasUnconscious) {
      setIsUnconscious(false);
      setDeathSaves({ successes: 0, failures: 0 });
    }
    
    toast({
      title: "Длинный отдых завершен",
      description: "HP полностью восстановлены",
    });
    
    setEvents(prev => [{
      id: generateEventId(),
      type: 'heal',
      amount: maxHp - currentHp,
      source: "Длинный отдых",
      timestamp: new Date()
    }, ...prev]);
  };
  
  return {
    currentHp,
    maxHp,
    tempHp,
    events,
    isUnconscious,
    deathSaves,
    applyDamage,
    applyHealing,
    setTemporaryHp,
    setCurrentHp: (hp: number) => setCurrentHp(Math.max(0, Math.min(maxHp, hp))),
    undoLastEvent,
    rollDeathSave,
    rollHitDieHealing,
    shortRest,
    longRest
  };
}
