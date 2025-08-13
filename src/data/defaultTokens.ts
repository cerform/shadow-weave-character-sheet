import { dragonImg, goblinImg, skeletonImg, golemImg, orcImg, wolfImg } from '@/assets/tokens';

export interface DefaultToken {
  id: string;
  name: string;
  image: string; // image path from assets/tokens
  type: 'monster' | 'beast' | 'undead' | 'construct' | 'humanoid';
  size: number;
  suggestedHP?: number;
  suggestedAC?: number;
  description: string;
  // Link to 3D model type for seamless 2D->3D mapping
  monsterType?: string;
}

export const defaultTokens: DefaultToken[] = [
  {
    id: 'dragon',
    name: 'Дракон',
    image: dragonImg,
    type: 'monster',
    size: 4,
    suggestedHP: 200,
    suggestedAC: 18,
    description: 'Могучий древний дракон',
    monsterType: 'dragon',
  },
  {
    id: 'goblin',
    name: 'Гоблин',
    image: goblinImg,
    type: 'humanoid',
    size: 0.5,
    suggestedHP: 7,
    suggestedAC: 15,
    description: 'Мелкий зеленокожий разбойник',
    monsterType: 'goblin',
  },
  {
    id: 'skeleton',
    name: 'Скелет',
    image: skeletonImg,
    type: 'undead',
    size: 1,
    suggestedHP: 13,
    suggestedAC: 13,
    description: 'Воскрешенный костяной воин',
    monsterType: 'skeleton',
  },
  {
    id: 'golem',
    name: 'Голем',
    image: golemImg,
    type: 'construct',
    size: 2,
    suggestedHP: 100,
    suggestedAC: 17,
    description: 'Каменный страж',
    monsterType: 'golem',
  },
  {
    id: 'orc',
    name: 'Орк',
    image: orcImg,
    type: 'humanoid',
    size: 1,
    suggestedHP: 15,
    suggestedAC: 13,
    description: 'Дикий воин-варвар',
    monsterType: 'orc',
  },
  {
    id: 'wolf',
    name: 'Волк',
    image: wolfImg,
    type: 'beast',
    size: 1,
    suggestedHP: 11,
    suggestedAC: 13,
    description: 'Хищный лесной зверь',
    monsterType: 'wolf',
  },
];

export const getTokenByType = (type: string): DefaultToken | undefined => {
  return defaultTokens.find(token => token.type === type);
};

export const getRandomTokenForType = (type: string): DefaultToken | undefined => {
  const tokensOfType = defaultTokens.filter(token => token.type === type);
  if (tokensOfType.length === 0) return undefined;
  return tokensOfType[Math.floor(Math.random() * tokensOfType.length)];
};