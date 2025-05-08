
export interface Theme {
  name: string;
  id: string;
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  text: string;
  cardBg: string;
  className?: string;
}

export const themes = [
  {
    id: 'classic',
    name: 'Classic D&D',
    primary: '#8B0000',
    secondary: '#FFD700',
    background: '#F5F5DC',
    accent: '#8B4513',
    text: '#000000',
    cardBg: '#FFFFFF'
  },
  {
    id: 'dark',
    name: 'Dark Dungeon',
    primary: '#4B0082',
    secondary: '#9932CC',
    background: '#1A1A1A',
    accent: '#8B008B',
    text: '#E0E0E0',
    cardBg: '#2D2D2D'
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: '#006400',
    secondary: '#228B22',
    background: '#F5F5DC',
    accent: '#556B2F',
    text: '#000000',
    cardBg: '#FFFFFF'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#000080',
    secondary: '#4169E1',
    background: '#F0F8FF',
    accent: '#1E90FF',
    text: '#000000',
    cardBg: '#FFFFFF'
  },
  {
    id: 'fire',
    name: 'Fire',
    primary: '#FF4500',
    secondary: '#FF8C00',
    background: '#FFFFE0',
    accent: '#B22222',
    text: '#000000',
    cardBg: '#FFFFFF'
  }
];

export default themes;
