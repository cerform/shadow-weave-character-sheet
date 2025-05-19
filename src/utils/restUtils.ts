
import { Character } from "@/types/character";

/**
 * Восстанавливает ресурсы персонажа после короткого отдыха
 */
export const takeShortRest = (character: Character): Character => {
  if (!character) return character;
  
  // Создаем копию персонажа для обновления
  const updatedCharacter = { ...character };
  
  // Восстановление хитов (если есть кость хитов)
  if (updatedCharacter.hitDice && updatedCharacter.hitDice.total > 0 && updatedCharacter.hitDice.used > 0) {
    // При коротком отдыхе можно восстановить кости хитов, но не все
    updatedCharacter.hitDice = {
      ...updatedCharacter.hitDice,
      used: Math.max(0, updatedCharacter.hitDice.used - 1) // Восстанавливаем 1 кость хитов
    };
  }
  
  // Восстановление особых ресурсов, которые восстанавливаются после короткого отдыха
  if (updatedCharacter.resources) {
    const updatedResources = { ...updatedCharacter.resources };
    
    Object.keys(updatedResources).forEach(key => {
      const resource = updatedResources[key];
      
      // Проверяем тип восстановления ресурса
      if (resource.recoveryType === 'short' || resource.recoveryType === 'shortRest') {
        updatedResources[key] = {
          ...resource,
          used: 0 // Полное восстановление ресурса
        };
      }
    });
    
    updatedCharacter.resources = updatedResources;
  }
  
  // Для колдуна восстанавливаем ячейки заклинаний
  if (updatedCharacter.class?.toLowerCase() === 'колдун' || updatedCharacter.class?.toLowerCase() === 'warlock') {
    if (updatedCharacter.spellSlots) {
      const updatedSpellSlots = { ...updatedCharacter.spellSlots };
      
      // У колдуна все ячейки восстанавливаются после короткого отдыха
      Object.keys(updatedSpellSlots).forEach(level => {
        updatedSpellSlots[level] = {
          ...updatedSpellSlots[level],
          used: 0 // Полное восстановление ячеек
        };
      });
      
      updatedCharacter.spellSlots = updatedSpellSlots;
    }
  }
  
  return updatedCharacter;
};

/**
 * Восстанавливает ресурсы персонажа после продолжительного отдыха
 */
export const takeLongRest = (character: Character): Character => {
  if (!character) return character;
  
  // Создаем копию персонажа для обновления
  const updatedCharacter = { ...character };
  
  // Восстановление хитов до максимума
  updatedCharacter.currentHp = updatedCharacter.maxHp;
  updatedCharacter.temporaryHp = 0; // Временные хиты исчезают
  
  // Восстановление костей хитов (половина от максимума)
  if (updatedCharacter.hitDice) {
    const maxRecovery = Math.max(1, Math.floor(updatedCharacter.hitDice.total / 2));
    const currentUsed = updatedCharacter.hitDice.used;
    
    updatedCharacter.hitDice = {
      ...updatedCharacter.hitDice,
      used: Math.max(0, currentUsed - maxRecovery) // Восстанавливаем половину потраченных костей хитов
    };
  }
  
  // Восстановление способностей заклинателя
  if (updatedCharacter.spellSlots) {
    const updatedSpellSlots = { ...updatedCharacter.spellSlots };
    
    // Восстанавливаем все ячейки заклинаний
    Object.keys(updatedSpellSlots).forEach(level => {
      updatedSpellSlots[level] = {
        ...updatedSpellSlots[level],
        used: 0 // Полное восстановление ячеек
      };
    });
    
    updatedCharacter.spellSlots = updatedSpellSlots;
  }
  
  // Восстановление специальных ресурсов
  if (updatedCharacter.resources) {
    const updatedResources = { ...updatedCharacter.resources };
    
    Object.keys(updatedResources).forEach(key => {
      const resource = updatedResources[key];
      
      // Все ресурсы восстанавливаются после длительного отдыха, если не указано иное
      if (!resource.recoveryType || resource.recoveryType === 'long' || resource.recoveryType === 'longRest') {
        updatedResources[key] = {
          ...resource,
          used: 0 // Полное восстановление ресурса
        };
      }
    });
    
    updatedCharacter.resources = updatedResources;
  }
  
  // Восстановление очков чародейства для чародея
  if (updatedCharacter.sorceryPoints) {
    updatedCharacter.sorceryPoints = {
      ...updatedCharacter.sorceryPoints,
      current: updatedCharacter.sorceryPoints.max
    };
  }
  
  // Сбросить счетчики смертельных спасбросков
  if (updatedCharacter.deathSaves) {
    updatedCharacter.deathSaves = {
      successes: 0,
      failures: 0
    };
  }
  
  return updatedCharacter;
};

/**
 * Восстановление ресурсов после боя
 */
export const postCombatRecovery = (character: Character): Character => {
  if (!character) return character;
  
  const updatedCharacter = { ...character };
  
  // Концентрация на заклинаниях прерывается
  // Можно реализовать, если в персонаже хранится информация о текущих заклинаниях
  
  // Эффекты, которые заканчиваются после боя, исчезают
  // Эту логику можно реализовать, если в персонаже есть список активных эффектов
  
  return updatedCharacter;
};

/**
 * Обновление глобальных модификаторов после изменения характеристик персонажа
 */
export const recalculateCharacterStats = (character: Character): Character => {
  if (!character) return character;
  
  const updatedCharacter = { ...character };
  
  // Пересчет бонуса мастерства
  const level = updatedCharacter.level || 1;
  updatedCharacter.proficiencyBonus = Math.ceil(1 + level / 4);
  
  // Пересчет модификаторов характеристик
  const getModifier = (score: number) => Math.floor((score - 10) / 2);
  
  // Обновляем модификаторы в skills, если они зависят от характеристик
  if (updatedCharacter.skills) {
    // Эту логику нужно реализовать в соответствии с вашей структурой данных
  }
  
  return updatedCharacter;
};
