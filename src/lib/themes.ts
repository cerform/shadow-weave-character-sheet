
// Типы и интерфейсы для системы тем
export interface Theme {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  textColor: string;
  cardBackground: string;
  buttonText?: string;
  borderColor?: string;
}

// Определения тем для приложения
export const themes: Record<string, Theme> = {
  default: {
    background: '#121212',
    foreground: '#1a1a1a',
    primary: '#8B5A2B',
    accent: '#8B5A2B',
    textColor: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    borderColor: '#8B5A2B'
  },
  warlock: {
    background: '#1E1A2B',
    foreground: '#2A1E40',
    primary: '#9061F9',
    accent: '#9061F9',
    textColor: '#FFFFFF',
    cardBackground: 'rgba(20, 15, 30, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#9061F9'
  },
  wizard: {
    background: '#152238',
    foreground: '#1E3054',
    primary: '#3B82F6',
    accent: '#3B82F6', 
    textColor: '#FFFFFF',
    cardBackground: 'rgba(15, 25, 40, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#3B82F6'
  },
  druid: {
    background: '#1B2D25',
    foreground: '#1E3A2B',
    primary: '#10B981',
    accent: '#10B981',
    textColor: '#FFFFFF',
    cardBackground: 'rgba(15, 30, 25, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#10B981'
  },
  warrior: {
    background: '#321E1E',
    foreground: '#4A2A2A',
    primary: '#F43F5E',
    accent: '#F43F5E',
    textColor: '#FFFFFF',
    cardBackground: 'rgba(35, 20, 20, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#F43F5E'
  },
  bard: {
    background: '#322815',
    foreground: '#403219',
    primary: '#F59E0B',
    accent: '#F59E0B',
    textColor: '#FFFFFF',
    cardBackground: 'rgba(35, 28, 15, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#F59E0B'
  }
};
