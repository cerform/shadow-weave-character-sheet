
import { Item } from '@/types/character';

/**
 * Проверка, является ли объект типом Item
 */
export function isItem(item: string | Item): item is Item {
  return typeof item === 'object' && item !== null;
}

/**
 * Получение строки для отображения предмета
 */
export function getItemDisplayText(item: Item): string {
  let displayText = item.name;
  
  if (item.quantity > 1) {
    displayText += ` (${item.quantity})`;
  }
  
  if (item.type) {
    displayText += ` [${item.type}]`;
  }
  
  return displayText;
}

/**
 * Преобразование строки в объект Item
 */
export function stringToItem(itemStr: string): Item {
  return {
    name: itemStr,
    quantity: 1
  };
}

/**
 * Нормализация массива элементов снаряжения
 */
export function normalizeItemArray(items: (string | Item)[]): Item[] {
  return items.map(item => {
    if (isItem(item)) {
      return item;
    }
    return stringToItem(item);
  });
}
