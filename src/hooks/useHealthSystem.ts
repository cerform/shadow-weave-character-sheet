
import { useState, useCallback, useEffect } from 'react';

// Экспортируем тип события здоровья
export type HealthEventType = 'damage' | 'healing' | 'temp_hp';

export interface HealthEvent {
  type: HealthEventType;
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

export const useHealthSystem = ({
  initialCurrentHp = 0,
  initialMaxHp = 1,
  initialTempHp = 0,
  constitutionModifier = 0,
  onHealthChange,
}: UseHealthSystemProps) => {
  // Основные состояния здоровья
  const [currentHp, setCurrentHp] = useState<number>(initialCurrentHp);
  const [maxHp, setMaxHp] = useState<number>(initialMaxHp);
  const [tempHp, setTempHpState] = useState<number>(initialTempHp); // Renamed to avoid conflict

  // Журнал событий здоровья
  const [events, setEvents] = useState<HealthEvent[]>([]);

  // Эффект для вызова обработчика при изменении состояния здоровья
  useEffect(() => {
    if (onHealthChange) {
      onHealthChange(currentHp, maxHp, tempHp);
    }
  }, [currentHp, maxHp, tempHp, onHealthChange]);

  // Установка значений HP с возможностью "тихого" режима (без уведомления)
  const setHp = useCallback((value: number, silent: boolean = false) => {
    setCurrentHp(Math.max(0, Math.min(value, maxHp)));
    if (!silent && onHealthChange) {
      onHealthChange(value, maxHp, tempHp);
    }
  }, [maxHp, tempHp, onHealthChange]);

  // Установка значений максимального HP с возможностью "тихого" режима
  const setMaxHitPoints = useCallback((value: number, silent: boolean = false) => {
    setMaxHp(Math.max(1, value));
    if (!silent && onHealthChange) {
      onHealthChange(currentHp, value, tempHp);
    }
  }, [currentHp, tempHp, onHealthChange]);

  // Установка значений временного HP с возможностью "тихого" режима
  const setTempHp = useCallback((value: number, silent: boolean = false) => {
    setTempHpState(Math.max(0, value)); // Using renamed state setter
    if (!silent && onHealthChange) {
      onHealthChange(currentHp, maxHp, value);
    }
  }, [currentHp, maxHp, onHealthChange]);

  // Применение урона
  const applyDamage = useCallback((amount: number, source?: string) => {
    if (amount <= 0) return;

    // Создаем новое событие
    const event: HealthEvent = {
      type: 'damage',
      amount,
      source,
      timestamp: Date.now(),
    };

    // Добавляем событие в журнал
    setEvents(prev => [event, ...prev]);

    // Обработка урона с учетом временных хитов
    if (tempHp > 0) {
      if (tempHp >= amount) {
        // Достаточно временных хитов, чтобы поглотить весь урон
        setTempHpState(tempHp - amount); // Using renamed state setter
      } else {
        // Временных хитов не хватает, остаток идет в основные хиты
        const remainingDamage = amount - tempHp;
        setTempHpState(0); // Using renamed state setter
        setCurrentHp(Math.max(0, currentHp - remainingDamage));
      }
    } else {
      // Нет временных хитов, весь урон идет в основные хиты
      setCurrentHp(Math.max(0, currentHp - amount));
    }
  }, [currentHp, tempHp]);

  // Применение лечения
  const applyHealing = useCallback((amount: number, source?: string) => {
    if (amount <= 0) return;

    // Создаем новое событие
    const event: HealthEvent = {
      type: 'healing',
      amount,
      source,
      timestamp: Date.now(),
    };

    // Добавляем событие в журнал
    setEvents(prev => [event, ...prev]);

    // Лечение не может превышать максимальное здоровье
    setCurrentHp(Math.min(currentHp + amount, maxHp));
  }, [currentHp, maxHp]);

  // Добавление временных хитов
  const addTempHp = useCallback((amount: number, source?: string) => {
    if (amount < 0) return;

    // Создаем новое событие
    const event: HealthEvent = {
      type: 'temp_hp',
      amount,
      source,
      timestamp: Date.now(),
    };

    // Добавляем событие в журнал только если это не сброс (amount > 0)
    if (amount > 0) {
      setEvents(prev => [event, ...prev]);
    }

    // Временные хиты не суммируются, берется наибольшее значение
    setTempHpState(Math.max(tempHp, amount)); // Using renamed state setter
  }, [tempHp]);

  // Отмена последнего события здоровья
  const undoLastEvent = useCallback(() => {
    if (events.length === 0) return;

    // Получаем последнее событие
    const lastEvent = events[0];

    // Удаляем его из журнала
    setEvents(prev => prev.slice(1));

    // Восстанавливаем состояние на основе типа события
    switch (lastEvent.type) {
      case 'damage':
        // Отмена урона - восстановление хитов
        setCurrentHp(Math.min(currentHp + lastEvent.amount, maxHp));
        break;
      case 'healing':
        // Отмена лечения - уменьшение хитов
        setCurrentHp(Math.max(0, currentHp - lastEvent.amount));
        break;
      case 'temp_hp':
        // Отмена добавления временных хитов
        setTempHpState(Math.max(0, tempHp - lastEvent.amount)); // Using renamed state setter
        break;
    }
  }, [events, currentHp, maxHp, tempHp]);

  return {
    currentHp,
    maxHp,
    tempHp,
    events,
    setHp,
    setMaxHitPoints,
    setTempHp,
    applyDamage,
    applyHealing,
    addTempHp,
    undoLastEvent
  };
};
