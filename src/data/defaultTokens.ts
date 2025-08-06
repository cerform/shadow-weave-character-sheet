import dragonImg from '@/assets/tokens/dragon.png';
import goblinImg from '@/assets/tokens/goblin.png';
import skeletonImg from '@/assets/tokens/skeleton.png';
import golemImg from '@/assets/tokens/golem.png';
import orcImg from '@/assets/tokens/orc.png';
import wolfImg from '@/assets/tokens/wolf.png';

export interface DefaultToken {
  id: string;
  name: string;
  image: string;
  type: 'monster' | 'beast' | 'undead' | 'construct' | 'humanoid';
  size: number;
  suggestedHP?: number;
  suggestedAC?: number;
  description: string;
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
    description: 'Могучий древний дракон'
  },
  {
    id: 'goblin',
    name: 'Гоблин',
    image: goblinImg,
    type: 'humanoid',
    size: 0.5,
    suggestedHP: 7,
    suggestedAC: 15,
    description: 'Мелкий зеленокожий разбойник'
  },
  {
    id: 'skeleton',
    name: 'Скелет',
    image: skeletonImg,
    type: 'undead',
    size: 1,
    suggestedHP: 13,
    suggestedAC: 13,
    description: 'Воскрешенный костяной воин'
  },
  {
    id: 'golem',
    name: 'Голем',
    image: golemImg,
    type: 'construct',
    size: 2,
    suggestedHP: 100,
    suggestedAC: 17,
    description: 'Каменный страж'
  },
  {
    id: 'orc',
    name: 'Орк',
    image: orcImg,
    type: 'humanoid',
    size: 1,
    suggestedHP: 15,
    suggestedAC: 13,
    description: 'Дикий воин-варвар'
  },
  {
    id: 'wolf',
    name: 'Волк',
    image: wolfImg,
    type: 'beast',
    size: 1,
    suggestedHP: 11,
    suggestedAC: 13,
    description: 'Хищный лесной зверь'
  }
];

export const getTokenByType = (type: string): DefaultToken | undefined => {
  return defaultTokens.find(token => token.type === type);
};

export const getRandomTokenForType = (type: string): DefaultToken | undefined => {
  const tokensOfType = defaultTokens.filter(token => token.type === type);
  if (tokensOfType.length === 0) return undefined;
  return tokensOfType[Math.floor(Math.random() * tokensOfType.length)];
};