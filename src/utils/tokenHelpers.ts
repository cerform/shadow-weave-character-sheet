
import { Token } from '@/types/battle';

export const getSizeMultiplier = (size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan' | number): number => {
  if (typeof size === 'number') {
    return size;
  }
  
  switch (size) {
    case 'tiny':
      return 0.5;
    case 'small':
      return 0.75;
    case 'medium':
      return 1;
    case 'large':
      return 1.5;
    case 'huge':
      return 2;
    case 'gargantuan':
      return 3;
    default:
      return 1;
  }
};

export const createToken = (type: "player" | "monster" | "npc" | "boss", name: string, options: Partial<Token> = {}): Omit<Token, 'id'> => {
  return {
    name,
    type,
    x: options.x || 100,
    y: options.y || 100,
    img: options.img || '/assets/default-token.png',
    hp: options.hp || 10,
    maxHp: options.maxHp || 10,
    ac: options.ac || 10,
    initiative: options.initiative || 0,
    conditions: options.conditions || [],
    resources: options.resources || {},
    visible: options.visible !== undefined ? options.visible : true,
    isVisible: options.isVisible !== undefined ? options.isVisible : true,
    size: options.size || 'medium',
    scale: options.scale || 1,
    rotation: options.rotation || 0,
    characterId: options.characterId,
    tokenColor: options.tokenColor
  };
};

export const calculateTokenSize = (token: Token, baseSize: number = 30): number => {
  return baseSize * getSizeMultiplier(token.size);
};
