
export const themes = {
  default: {
    accent: '#8B5A2B',
    glow: '0 0 15px rgba(139, 90, 43, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(139, 90, 43, 0.8)'
  },
  warlock: {
    accent: '#9061F9',
    glow: '0 0 15px rgba(144, 97, 249, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(144, 97, 249, 0.8)'
  },
  wizard: {
    accent: '#3B82F6',
    glow: '0 0 15px rgba(59, 130, 246, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(59, 130, 246, 0.8)'
  },
  druid: {
    accent: '#10B981',
    glow: '0 0 15px rgba(16, 185, 129, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(16, 185, 129, 0.8)'
  },
  warrior: {
    accent: '#F43F5E',
    glow: '0 0 15px rgba(244, 63, 94, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(244, 63, 94, 0.8)'
  },
  bard: {
    accent: '#F59E0B',
    glow: '0 0 15px rgba(245, 158, 11, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(245, 158, 11, 0.8)'
  },
  dark: {
    accent: '#4c6ef5',
    glow: '0 0 15px rgba(76, 110, 245, 0.5)',
    textColor: '#FFFFFF',
    mutedTextColor: '#DDDDDD',
    cardBackground: '#1a1a1a',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(76, 110, 245, 0.8)'
  },
  fantasy: {
    accent: '#9d7e59',
    glow: '0 0 15px rgba(157, 126, 89, 0.5)',
    textColor: '#e6d8b5',
    mutedTextColor: '#c4b89c',
    cardBackground: '#353441',
    buttonText: '#e6d8b5',
    buttonBackground: 'rgba(157, 126, 89, 0.8)'
  },
  cyber: {
    accent: '#00aaff',
    glow: '0 0 15px rgba(0, 170, 255, 0.5)',
    textColor: '#00ffaa',
    mutedTextColor: '#00ccaa',
    cardBackground: '#14141e',
    buttonText: '#FFFFFF',
    buttonBackground: 'rgba(0, 170, 255, 0.8)'
  },
  nature: {
    accent: '#5a9e7a',
    glow: '0 0 15px rgba(90, 158, 122, 0.5)',
    textColor: '#e5f5eb',
    mutedTextColor: '#c8e5d1',
    cardBackground: '#2a4438',
    buttonText: '#e5f5eb',
    buttonBackground: 'rgba(90, 158, 122, 0.8)'
  }
};

export type ThemeKey = keyof typeof themes;
