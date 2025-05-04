
import { useState, useCallback } from 'react';
import { HealthEvent } from './useHealthSystem';

interface UseDamageLogReturn {
  currentHp: number;
  tempHp: number;
  events: HealthEvent[];
  applyDamage: (amount: number, source?: string) => void;
  applyHealing: (amount: number, source?: string) => void;
  addTempHp: (amount: number, source?: string) => void;
  undoLastEvent: () => void;
  setHp: (value: number, silent?: boolean) => void;
  setTempHp: (value: number, silent?: boolean) => void;
}

export const useDamageLog = (
  initialCurrentHp: number,
  initialMaxHp: number,
  onChange?: (hp: number, tempHp: number) => void
): UseDamageLogReturn => {
  const [currentHp, setCurrentHpState] = useState<number>(initialCurrentHp);
  const [tempHp, setTempHpState] = useState<number>(0);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  
  // Функция установки HP с возможностью "тихого" режима
  const setHp = useCallback((value: number, silent: boolean = false): void => {
    const newValue = Math.max(0, Math.min(value, initialMaxHp));
    setCurrentHpState(newValue);
    
    if (!silent && onChange) {
      onChange(newValue, tempHp);
    }
  }, [initialMaxHp, tempHp, onChange]);
  
  // Функция установки временного HP с возможностью "тихого" режима
  const setTempHp = useCallback((value: number, silent: boolean = false): void => {
    const newValue = Math.max(0, value);
    setTempHpState(newValue);
    
    if (!silent && onChange) {
      onChange(currentHp, newValue);
    }
  }, [currentHp, onChange]);
  
  // Применение урона
  const applyDamage = useCallback((amount: number, source?: string): void => {
    if (amount <= 0) return;
    
    // Создаем новое событие урона
    const event: HealthEvent = {
      type: 'damage',
      amount,
      source,
      timestamp: Date.now()
    };
    
    // Добавляем в историю событий
    setEvents(prev => [event, ...prev]);
    
    // Применяем урон сначала к временным хитам
    if (tempHp > 0) {
      if (tempHp >= amount) {
        // Все поглощается временными хитами
        setTempHp(tempHp - amount);
      } else {
        // Часть поглощается временными хитами, остальное идет по основным хитам
        const remainingDamage = amount - tempHp;
        setTempHp(0);
        setHp(Math.max(0, currentHp - remainingDamage));
      }
    } else {
      // Все идет по основным хитам
      setHp(Math.max(0, currentHp - amount));
    }
  }, [currentHp, tempHp, setHp, setTempHp]);
  
  // Применение лечения
  const applyHealing = useCallback((amount: number, source?: string): void => {
    if (amount <= 0) return;
    
    // Создаем новое событие лечения
    const event: HealthEvent = {
      type: 'healing',
      amount,
      source,
      timestamp: Date.now()
    };
    
    // Добавляем в историю событий
    setEvents(prev => [event, ...prev]);
    
    // Применяем лечение (не превышая максимум)
    setHp(Math.min(currentHp + amount, initialMaxHp));
  }, [currentHp, initialMaxHp, setHp]);
  
  // Добавление временных хитов
  const addTempHp = useCallback((amount: number, source?: string): void => {
    if (amount < 0) return;
    
    // Создаем новое событие временных хитов
    const event: HealthEvent = {
      type: 'temp_hp',
      amount,
      source,
      timestamp: Date.now()
    };
    
    // Добавляем в историю событий
    if (amount > 0) {
      setEvents(prev => [event, ...prev]);
    }
    
    // Временные хиты не суммируются, берется наибольшее значение
    setTempHp(Math.max(tempHp, amount));
  }, [tempHp, setTempHp]);
  
  // Отмена последнего события
  const undoLastEvent = useCallback((): void => {
    if (events.length === 0) return;
    
    const lastEvent = events[0];
    
    // Удаляем событие из истории
    setEvents(prev => prev.slice(1));
    
    // Отменяем эффект события в зависимости от типа
    switch (lastEvent.type) {
      case 'damage':
        // Восстанавливаем хиты
        setHp(Math.min(currentHp + lastEvent.amount, initialMaxHp));
        break;
      case 'healing':
        // Убираем лечение
        setHp(Math.max(0, currentHp - lastEvent.amount));
        break;
      case 'temp_hp':
        // Убираем временные хиты
        setTempHp(Math.max(0, tempHp - lastEvent.amount));
        break;
    }
  }, [events, currentHp, initialMaxHp, tempHp, setHp, setTempHp]);
  
  return {
    currentHp,
    tempHp,
    events,
    applyDamage,
    applyHealing,
    addTempHp,
    undoLastEvent,
    setHp,
    setTempHp
  };
};
