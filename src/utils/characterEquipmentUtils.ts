
import { Character, Item } from '@/types/character';

// Преобразует старый формат снаряжения в новый
export const convertEquipmentToItemArray = (equipment: any): Item[] => {
  if (Array.isArray(equipment)) {
    return equipment;
  }

  const items: Item[] = [];

  // Преобразуем оружие
  if (equipment.weapons && Array.isArray(equipment.weapons)) {
    equipment.weapons.forEach((weapon: string) => {
      items.push({
        name: weapon,
        quantity: 1,
        type: 'weapon',
        equipped: true
      });
    });
  }

  // Преобразуем доспехи
  if (equipment.armor && typeof equipment.armor === 'string') {
    items.push({
      name: equipment.armor,
      quantity: 1,
      type: 'armor',
      equipped: true
    });
  }

  // Преобразуем другие предметы
  if (equipment.items && Array.isArray(equipment.items)) {
    equipment.items.forEach((item: string) => {
      items.push({
        name: item,
        quantity: 1
      });
    });
  }

  return items;
};

// Обеспечивает совместимость с обоими форматами снаряжения
export const updateCharacterEquipment = (
  character: Character, 
  newEquipment: Item[] | { weapons: string[]; armor: string; items: string[] }
): Character => {
  if (Array.isArray(newEquipment)) {
    return {
      ...character,
      equipment: newEquipment
    };
  } else {
    // Если передан старый формат, преобразуем его в новый
    return {
      ...character,
      equipment: convertEquipmentToItemArray(newEquipment)
    };
  }
};
