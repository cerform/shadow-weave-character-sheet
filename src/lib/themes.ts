
// Типы и интерфейсы для тем
export interface ThemeStyle {
  accent: string;
  glow: string;
  textColor: string;
  mutedTextColor: string;
  cardBackground: string;
  buttonText: string;
  buttonBackground: string;
}

// Объект с темами
export const themes: Record<string, ThemeStyle> = {
  default: {
    accent: '#8B5A2B',
    glow: '0 0 15px rgba(139, 90, 43, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(139, 90, 43, 0.8)'
  },
  dark: {
    accent: '#6366F1',
    glow: '0 0 15px rgba(99, 102, 241, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(99, 102, 241, 0.8)'
  },
  fantasy: {
    accent: '#B69F7E',
    glow: '0 0 15px rgba(182, 159, 126, 0.5)',
    textColor: '#E6D8B5',
    mutedTextColor: '#D0C4A6',
    cardBackground: 'rgba(31, 29, 27, 0.95)',
    buttonText: '#E6D8B5',
    buttonBackground: 'rgba(182, 159, 126, 0.8)'
  },
  cyber: {
    accent: '#00FFAA',
    glow: '0 0 15px rgba(0, 255, 170, 0.5)',
    textColor: '#00FFAA',
    mutedTextColor: '#00D699',
    cardBackground: 'rgba(0, 20, 40, 0.95)',
    buttonText: '#000000',
    buttonBackground: 'rgba(0, 255, 170, 0.8)'
  },
  nature: {
    accent: '#8CC474',
    glow: '0 0 15px rgba(140, 196, 116, 0.5)',
    textColor: '#E5F5EB',
    mutedTextColor: '#C2E0D0',
    cardBackground: 'rgba(29, 51, 42, 0.95)',
    buttonText: '#E5F5EB',
    buttonBackground: 'rgba(140, 196, 116, 0.8)'
  },
  warlock: {
    accent: '#9061F9',
    glow: '0 0 15px rgba(144, 97, 249, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(25, 15, 40, 0.95)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(144, 97, 249, 0.8)'
  },
  wizard: {
    accent: '#3B82F6',
    glow: '0 0 15px rgba(59, 130, 246, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(15, 23, 42, 0.95)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(59, 130, 246, 0.8)'
  },
  druid: {
    accent: '#10B981',
    glow: '0 0 15px rgba(16, 185, 129, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(15, 40, 25, 0.95)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(16, 185, 129, 0.8)'
  },
  warrior: {
    accent: '#F43F5E',
    glow: '0 0 15px rgba(244, 63, 94, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(40, 15, 20, 0.95)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(244, 63, 94, 0.8)'
  },
  bard: {
    accent: '#F59E0B',
    glow: '0 0 15px rgba(245, 158, 11, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(40, 30, 10, 0.95)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(245, 158, 11, 0.8)'
  }
};

export default themes;
