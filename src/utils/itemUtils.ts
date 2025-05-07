
import { Item } from '@/types/character';

export const isItem = (item: any): item is Item => {
  return item && typeof item === 'object' && 'name' in item && typeof item.name === 'string';
};

export const getItemDisplayText = (item: string | Item): string => {
  if (isItem(item)) {
    const { name, quantity } = item;
    return quantity > 1 ? `${name} (${quantity})` : name;
  }
  return String(item);
};

// Add the missing utility functions
export const getItemName = (item: string | Item): string => {
  if (isItem(item)) {
    return item.name;
  }
  return String(item);
};

export const getItemType = (item: string | Item): string => {
  if (isItem(item)) {
    return item.type || 'предмет';
  }
  return 'предмет';
};

export const getItemQuantity = (item: string | Item): number => {
  if (isItem(item)) {
    return item.quantity || 1;
  }
  return 1;
};
