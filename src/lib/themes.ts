
export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  text: string;
  cardBg: string;
  // Добавляем необходимые поля, на которые ссылаются компоненты
  textColor: string;
  buttonText: string;
  cardBackground: string;
  mutedTextColor: string;
  foreground: string;
  className?: string;
}

// Создаем темы с новыми свойствами
const themes: Record<string, Theme> = {
  default: {
    id: 'classic',
    name: 'Classic D&D',
    primary: '#8B0000',
    secondary: '#FFD700',
    background: '#F5F5DC',
    accent: '#8B4513',
    text: '#000000',
    cardBg: '#FFFFFF',
    textColor: '#000000',
    buttonText: '#FFFFFF',
    cardBackground: '#FFFFFF',
    mutedTextColor: '#666666',
    foreground: '#000000'
  },
  dark: {
    id: 'dark',
    name: 'Dark Dungeon',
    primary: '#4B0082',
    secondary: '#9932CC',
    background: '#1A1A1A',
    accent: '#8B008B',
    text: '#E0E0E0',
    cardBg: '#2D2D2D',
    textColor: '#E0E0E0',
    buttonText: '#FFFFFF',
    cardBackground: '#2D2D2D',
    mutedTextColor: '#AAAAAA',
    foreground: '#E0E0E0'
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    primary: '#006400',
    secondary: '#228B22',
    background: '#F5F5DC',
    accent: '#556B2F',
    text: '#000000',
    cardBg: '#FFFFFF',
    textColor: '#000000',
    buttonText: '#FFFFFF',
    cardBackground: '#FFFFFF',
    mutedTextColor: '#666666',
    foreground: '#000000'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primary: '#000080',
    secondary: '#4169E1',
    background: '#F0F8FF',
    accent: '#1E90FF',
    text: '#000000',
    cardBg: '#FFFFFF',
    textColor: '#000000',
    buttonText: '#FFFFFF',
    cardBackground: '#FFFFFF',
    mutedTextColor: '#666666',
    foreground: '#000000'
  },
  fire: {
    id: 'fire',
    name: 'Fire',
    primary: '#FF4500',
    secondary: '#FF8C00',
    background: '#FFFFE0',
    accent: '#B22222',
    text: '#000000',
    cardBg: '#FFFFFF',
    textColor: '#000000',
    buttonText: '#FFFFFF',
    cardBackground: '#FFFFFF',
    mutedTextColor: '#666666',
    foreground: '#000000'
  },
  // Дополнительные темы из компонентов
  warlock: {
    id: 'warlock',
    name: 'Чернокнижник',
    primary: '#7D26CD',
    secondary: '#AB82FF',
    background: '#180026',
    accent: '#9932CC',
    text: '#E6E6FA',
    cardBg: '#2D1F3D',
    textColor: '#E6E6FA',
    buttonText: '#FFFFFF',
    cardBackground: '#2D1F3D',
    mutedTextColor: '#B19CD9',
    foreground: '#E6E6FA'
  },
  wizard: {
    id: 'wizard',
    name: 'Волшебник',
    primary: '#4169E1',
    secondary: '#87CEFA',
    background: '#00008B',
    accent: '#1E90FF',
    text: '#F0F8FF',
    cardBg: '#27408B',
    textColor: '#F0F8FF',
    buttonText: '#FFFFFF',
    cardBackground: '#27408B',
    mutedTextColor: '#ADD8E6',
    foreground: '#F0F8FF'
  },
  druid: {
    id: 'druid',
    name: 'Друид',
    primary: '#006400',
    secondary: '#32CD32',
    background: '#0B3B0B',
    accent: '#2E8B57',
    text: '#F0FFF0',
    cardBg: '#2F4F2F',
    textColor: '#F0FFF0',
    buttonText: '#FFFFFF',
    cardBackground: '#2F4F2F',
    mutedTextColor: '#98FB98',
    foreground: '#F0FFF0'
  },
  warrior: {
    id: 'warrior',
    name: 'Воин',
    primary: '#8B0000',
    secondary: '#CD5C5C',
    background: '#3D0C0C',
    accent: '#B22222',
    text: '#FFE4E1',
    cardBg: '#4A1010',
    textColor: '#FFE4E1',
    buttonText: '#FFFFFF',
    cardBackground: '#4A1010',
    mutedTextColor: '#FFA07A',
    foreground: '#FFE4E1'
  },
  bard: {
    id: 'bard',
    name: 'Бард',
    primary: '#DAA520',
    secondary: '#FFD700',
    background: '#3D2B1F',
    accent: '#FFA500',
    text: '#FFF8DC',
    cardBg: '#3D2B1F',
    textColor: '#FFF8DC',
    buttonText: '#000000',
    cardBackground: '#4A3728',
    mutedTextColor: '#F4A460',
    foreground: '#FFF8DC'
  }
};

// Экспортируем массив тем для обратной совместимости
export const themesArray = Object.values(themes);

export default themes;
