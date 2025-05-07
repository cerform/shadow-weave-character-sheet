
import { Character, Item } from '@/types/character';

/**
 * Нормализует оборудование персонажа в массив Item[]
 */
export function normalizeEquipment(equipment: Character['equipment']): Item[] {
  if (!equipment) return [];
  
  if (Array.isArray(equipment)) {
    // Если это уже массив Item[] или строк
    return equipment.map(item => {
      if (typeof item === 'string') {
        return {
          name: item,
          quantity: 1
        };
      }
      return item;
    });
  } else {
    // Если это объект с оружием, броней и предметами
    const result: Item[] = [];
    
    // Добавляем оружие
    if (equipment.weapons) {
      equipment.weapons.forEach(weapon => {
        result.push({
          name: weapon,
          quantity: 1,
          type: 'weapon'
        });
      });
    }
    
    // Добавляем броню
    if (equipment.armor) {
      result.push({
        name: equipment.armor,
        quantity: 1,
        type: 'armor',
        equipped: true
      });
    }
    
    // Добавляем предметы
    if (equipment.items) {
      equipment.items.forEach(item => {
        result.push({
          name: item,
          quantity: 1
        });
      });
    }
    
    return result;
  }
}

/**
 * Обновляет оборудование персонажа с правильным типом
 */
export function updateCharacterEquipment(character: Character, equipment: Item[]): Partial<Character> {
  return {
    equipment: equipment as Item[]
  };
}
