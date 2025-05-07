
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
