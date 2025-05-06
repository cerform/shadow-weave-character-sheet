
import { Item } from '@/types/character';

/**
 * Проверяет, является ли переданное значение объектом Item
 */
export function isItem(item: string | Item): item is Item {
  return typeof item !== 'string' && 
    item !== null && 
    typeof item === 'object' && 
    'name' in item && 
    'quantity' in item;
}

/**
 * Возвращает строковое представление предмета
 */
export function getItemDisplayText(item: string | Item): string {
  if (isItem(item)) {
    return `${item.name}${item.quantity > 1 ? ` (${item.quantity})` : ''}`;
  }
  return item;
}

/**
 * Возвращает тип предмета
 */
export function getItemType(item: string | Item): string {
  if (isItem(item)) {
    return item.type || 'предмет';
  }
  return 'предмет';
}

/**
 * Возвращает имя предмета
 */
export function getItemName(item: string | Item): string {
  if (isItem(item)) {
    return item.name;
  }
  return item;
}

/**
 * Возвращает количество предмета
 */
export function getItemQuantity(item: string | Item): number {
  if (isItem(item)) {
    return item.quantity;
  }
  return 1;
}
