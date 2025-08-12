export interface DefaultToken {
  id: string;
  name: string;
  image: string; // inline SVG data URL (no external files)
  type: 'monster' | 'beast' | 'undead' | 'construct' | 'humanoid';
  size: number;
  suggestedHP?: number;
  suggestedAC?: number;
  description: string;
}

const svgIcon = (label: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
      <defs>
        <radialGradient id='g' cx='50%' cy='40%'>
          <stop offset='0%' stop-color='${color}' stop-opacity='0.95'/>
          <stop offset='100%' stop-color='${color}' stop-opacity='0.6'/>
        </radialGradient>
      </defs>
      <circle cx='64' cy='64' r='58' fill='url(#g)' stroke='black' stroke-width='4'/>
      <text x='50%' y='66%' font-size='44' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' fill='white' stroke='black' stroke-width='2'>${label}</text>
    </svg>`
  )}`;

export const defaultTokens: DefaultToken[] = [
  {
    id: 'dragon',
    name: 'Дракон',
    image: svgIcon('D', '#ef4444'),
    type: 'monster',
    size: 4,
    suggestedHP: 200,
    suggestedAC: 18,
    description: 'Могучий древний дракон',
  },
  {
    id: 'goblin',
    name: 'Гоблин',
    image: svgIcon('G', '#22c55e'),
    type: 'humanoid',
    size: 0.5,
    suggestedHP: 7,
    suggestedAC: 15,
    description: 'Мелкий зеленокожий разбойник',
  },
  {
    id: 'skeleton',
    name: 'Скелет',
    image: svgIcon('S', '#e5e7eb'),
    type: 'undead',
    size: 1,
    suggestedHP: 13,
    suggestedAC: 13,
    description: 'Воскрешенный костяной воин',
  },
  {
    id: 'golem',
    name: 'Голем',
    image: svgIcon('Gm', '#78716c'),
    type: 'construct',
    size: 2,
    suggestedHP: 100,
    suggestedAC: 17,
    description: 'Каменный страж',
  },
  {
    id: 'orc',
    name: 'Орк',
    image: svgIcon('O', '#16a34a'),
    type: 'humanoid',
    size: 1,
    suggestedHP: 15,
    suggestedAC: 13,
    description: 'Дикий воин-варвар',
  },
  {
    id: 'wolf',
    name: 'Волк',
    image: svgIcon('W', '#64748b'),
    type: 'beast',
    size: 1,
    suggestedHP: 11,
    suggestedAC: 13,
    description: 'Хищный лесной зверь',
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