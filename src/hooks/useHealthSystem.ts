
import { useState, useEffect } from 'react';

interface HealthEvent {
  type: 'damage' | 'healing' | 'temp_hp';
  amount: number;
  source?: string;
  timestamp: number;
}

interface UseHealthSystemProps {
  initialCurrentHp: number;
  initialMaxHp: number;
  initialTempHp: number;
  constitutionModifier: number;
  onHealthChange?: (currentHp: number, maxHp: number, tempHp: number) => void;
}

export function useHealthSystem({
  initialCurrentHp = 0,
  initialMaxHp = 1,
  initialTempHp = 0,
  constitutionModifier = 0,
  onHealthChange
}: UseHealthSystemProps) {
  const [currentHp, setCurrentHp] = useState(initialCurrentHp);
  const [maxHp, setMaxHp] = useState(initialMaxHp);
  const [tempHp, setTempHp] = useState(initialTempHp);
  const [events, setEvents] = useState<HealthEvent[]>([]);

  // Обработка урона
  const applyDamage = (amount: number, source: string = 'Урон') => {
    if (amount <= 0) return;

    let newTempHp = tempHp;
    let newCurrentHp = currentHp;
    let damageToHp = amount;

    // Сначала урон идет по временным хитам
    if (tempHp > 0) {
      if (tempHp >= amount) {
        newTempHp -= amount;
        damageToHp = 0;
      } else {
        damageToHp -= tempHp;
        newTempHp = 0;
      }
    }

    // Затем урон идет по обычным хитам
    if (damageToHp > 0) {
      newCurrentHp = Math.max(0, newCurrentHp - damageToHp);
    }

    // Регистрируем событие
    const newEvent: HealthEvent = {
      type: 'damage',
      amount: amount,
      source: source,
      timestamp: Date.now()
    };

    setTempHp(newTempHp);
    setCurrentHp(newCurrentHp);
    setEvents(prev => [newEvent, ...prev]);

    if (onHealthChange) {
      onHealthChange(newCurrentHp, maxHp, newTempHp);
    }
  };

  // Обработка лечения
  const applyHealing = (amount: number, source: string = 'Лечение') => {
    if (amount <= 0) return;

    // Лечение не может превысить максимальные хиты
    const newCurrentHp = Math.min(currentHp + amount, maxHp);

    // Регистрируем событие
    const newEvent: HealthEvent = {
      type: 'healing',
      amount: amount,
      source: source,
      timestamp: Date.now()
    };

    setCurrentHp(newCurrentHp);
    setEvents(prev => [newEvent, ...prev]);

    if (onHealthChange) {
      onHealthChange(newCurrentHp, maxHp, tempHp);
    }
  };

  // Добавление временных хитов
  const addTempHp = (amount: number, source: string = 'Временные HP') => {
    if (amount <= 0) return;

    // Временные хиты не складываются, берем максимальное значение
    const newTempHp = Math.max(tempHp, amount);

    // Регистрируем событие
    const newEvent: HealthEvent = {
      type: 'temp_hp',
      amount: amount,
      source: source,
      timestamp: Date.now()
    };

    setTempHp(newTempHp);
    setEvents(prev => [newEvent, ...prev]);

    if (onHealthChange) {
      onHealthChange(currentHp, maxHp, newTempHp);
    }
  };

  // Отмена последнего действия
  const undoLastEvent = () => {
    if (events.length === 0) return;

    const [lastEvent, ...restEvents] = events;
    setEvents(restEvents);

    switch (lastEvent.type) {
      case 'damage':
        // Восстановление хитов от урона
        let restoredCurrentHp = currentHp;
        let restoredTempHp = tempHp;

        // Если были потрачены обычные хиты
        if (currentHp < maxHp) {
          const hpToRestore = Math.min(lastEvent.amount, maxHp - currentHp);
          restoredCurrentHp += hpToRestore;
          
          // Если осталось еще урона для восстановления временных хитов
          const remainingDamage = lastEvent.amount - hpToRestore;
          if (remainingDamage > 0) {
            restoredTempHp += remainingDamage;
          }
        } else {
          // Если все обычные хиты целы, значит весь урон был по временным хитам
          restoredTempHp += lastEvent.amount;
        }

        setCurrentHp(restoredCurrentHp);
        setTempHp(restoredTempHp);
        break;

      case 'healing':
        // Отмена лечения
        setCurrentHp(Math.max(0, currentHp - lastEvent.amount));
        break;

      case 'temp_hp':
        // Отмена временных хитов сложнее, т.к. они могли уже быть потрачены
        // Упрощенный подход - просто сбросить до 0, если они были основным источником
        if (lastEvent.amount >= tempHp) {
          setTempHp(0);
        }
        break;
    }

    if (onHealthChange) {
      onHealthChange(currentHp, maxHp, tempHp);
    }
  };

  // Инициализация и синхронизация значений
  useEffect(() => {
    setCurrentHp(initialCurrentHp);
    setMaxHp(initialMaxHp);
    setTempHp(initialTempHp);
  }, [initialCurrentHp, initialMaxHp, initialTempHp]);

  return {
    currentHp,
    maxHp,
    tempHp,
    events,
    applyDamage,
    applyHealing,
    addTempHp,
    undoLastEvent
  };
}
