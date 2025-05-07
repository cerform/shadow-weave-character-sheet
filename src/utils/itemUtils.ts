
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

/**
 * Получение названия предмета
 */
export function getItemName(item: string | Item): string {
  if (isItem(item)) {
    return item.name;
  }
  return item;
}

/**
 * Получение типа предмета
 */
export function getItemType(item: string | Item): string | undefined {
  if (isItem(item)) {
    return item.type;
  }
  return undefined;
}

/**
 * Получение количества предметов
 */
export function getItemQuantity(item: string | Item): number {
  if (isItem(item)) {
    return item.quantity;
  }
  return 1;
}
