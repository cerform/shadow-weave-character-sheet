
import { Token } from '@/types/battle';

/**
 * Converts a size string to a numeric size multiplier
 * @param size The size string or number
 * @returns The numeric size multiplier
 */
export const getSizeMultiplier = (size?: Token['size']): number => {
  if (typeof size === 'number') return size;
  
  switch (size) {
    case 'tiny': return 0.5;
    case 'small': return 0.8;
    case 'medium': return 1;
    case 'large': return 1.5;
    case 'huge': return 2;
    case 'gargantuan': return 3;
    default: return 1;
  }
};

/**
 * Converts a numeric size to a size category
 * @param sizeMultiplier The numeric size multiplier
 * @returns The size category
 */
export const getSizeCategory = (sizeMultiplier: number): Token['size'] => {
  if (sizeMultiplier <= 0.5) return 'tiny';
  if (sizeMultiplier <= 0.8) return 'small';
  if (sizeMultiplier <= 1.2) return 'medium';
  if (sizeMultiplier <= 1.8) return 'large';
  if (sizeMultiplier <= 2.5) return 'huge';
  return 'gargantuan';
};

/**
 * Creates a new token with default values
 * @param type The token type
 * @param name The token name
 * @param options Additional options
 * @returns A new token object
 */
export const createToken = (
  type: Token['type'], 
  name: string,
  options: Partial<Token> = {}
): Omit<Token, 'id'> => {
  return {
    name,
    type,
    x: options.x || 100,
    y: options.y || 100,
    maxHp: options.maxHp || (type === 'boss' ? 100 : type === 'monster' ? 20 : 30),
    hp: options.hp || (type === 'boss' ? 100 : type === 'monster' ? 20 : 30),
    ac: options.ac || (type === 'boss' ? 17 : type === 'monster' ? 13 : 15),
    initiative: options.initiative || 0,
    isVisible: options.isVisible !== undefined ? options.isVisible : true,
    visible: options.visible !== undefined ? options.visible : true,
    size: options.size || (type === 'boss' ? 'large' : 'medium'),
    img: options.img || '',
    conditions: options.conditions || [],
    resources: options.resources || {},
    ...options
  };
};
