
// Fixed restUtils.ts to correct string comparison issues
import { Character } from '@/types/character';

// Функция для короткого отдыха
export function takeShortRest(character: Character): Character {
  if (!character) return character;
  
  let updatedCharacter = { ...character };
  
  // Восстановление ресурсов, которые восстанавливаются после короткого отдыха
  if (updatedCharacter.resources) {
    Object.keys(updatedCharacter.resources).forEach(resourceKey => {
      const resource = updatedCharacter.resources?.[resourceKey];
      
      // Проверяем, что ресурс восстанавливается после короткого отдыха
      // Исправлено сравнение строк - добавляем все возможные варианты написания
      if (resource && (
        resource.recoveryType === 'short' || 
        resource.recoveryType === 'short-rest' || 
        resource.recoveryType === 'shortRest'
      )) {
        updatedCharacter.resources = {
          ...updatedCharacter.resources,
          [resourceKey]: {
            ...resource,
            used: 0,
            current: resource.max
          }
        };
      }
    });
  }
  
  // Восстановление хитов через Кость Хитов
  // Дополнительная логика может быть добавлена здесь
  
  return updatedCharacter;
}

// Функция для длинного отдыха
export function takeLongRest(character: Character): Character {
  if (!character) return character;
  
  let updatedCharacter = { ...character };
  
  // Полное восстановление хитов
  updatedCharacter.currentHp = updatedCharacter.maxHp;
  updatedCharacter.tempHp = 0;  // Временные хиты сбрасываются
  
  // Восстановление всех ячеек заклинаний
  if (updatedCharacter.spellSlots) {
    Object.keys(updatedCharacter.spellSlots).forEach(level => {
      if (updatedCharacter.spellSlots?.[Number(level)]) {
        updatedCharacter.spellSlots = {
          ...updatedCharacter.spellSlots,
          [level]: {
            ...updatedCharacter.spellSlots[Number(level)],
            used: 0,
            current: updatedCharacter.spellSlots[Number(level)].max
          }
        };
      }
    });
  }
  
  // Восстановление всех ресурсов
  if (updatedCharacter.resources) {
    Object.keys(updatedCharacter.resources).forEach(resourceKey => {
      const resource = updatedCharacter.resources?.[resourceKey];
      
      // Исправлено сравнение строк для всех типов ресурсов
      // Добавляем все возможные варианты написания
      if (resource && (
        resource.recoveryType === 'long' || 
        resource.recoveryType === 'long-rest' || 
        resource.recoveryType === 'longRest' || 
        resource.recoveryType === 'short' || 
        resource.recoveryType === 'short-rest' || 
        resource.recoveryType === 'shortRest'
      )) {
        updatedCharacter.resources = {
          ...updatedCharacter.resources,
          [resourceKey]: {
            ...resource,
            used: 0,
            current: resource.max
          }
        };
      }
    });
  }
  
  // Восстановление ячеек Костей Хитов (обычно половина максимума)
  if (updatedCharacter.hitDice) {
    const maxHitDice = updatedCharacter.hitDice.total;
    const currentUsed = updatedCharacter.hitDice.used;
    const regainedHitDice = Math.min(Math.floor(maxHitDice / 2), currentUsed);
    
    updatedCharacter.hitDice = {
      ...updatedCharacter.hitDice,
      used: currentUsed - regainedHitDice
    };
  }
  
  // Сброс спасбросков от смерти
  if (updatedCharacter.deathSaves) {
    updatedCharacter.deathSaves = {
      successes: 0,
      failures: 0
    };
  }
  
  return updatedCharacter;
}
