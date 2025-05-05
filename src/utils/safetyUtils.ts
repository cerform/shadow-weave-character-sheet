
/**
 * Утилиты для безопасной работы с различными типами данных
 */

// Функция для определения длины equipment, которое может быть массивом или объектом
export const getEquipmentLength = (equipment: any): number => {
  if (!equipment) return 0;
  
  // Если это массив
  if (Array.isArray(equipment)) {
    return equipment.length;
  }
  
  // Если это объект со свойствами weapons, armor и items
  let count = 0;
  
  if (equipment.weapons && Array.isArray(equipment.weapons)) {
    count += equipment.weapons.length;
  }
  
  if (equipment.armor) {
    count += 1;
  }
  
  if (equipment.items && Array.isArray(equipment.items)) {
    count += equipment.items.length;
  }
  
  return count;
};

// Функция для определения, является ли оборудование пустым
export const isEquipmentEmpty = (equipment: any): boolean => {
  return getEquipmentLength(equipment) === 0;
};
