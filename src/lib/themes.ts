// Типы и интерфейсы для системы тем
export interface Theme {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  textColor: string;
  mutedTextColor: string;
  cardBackground: string;
  inputBackground: string;
  buttonText?: string;
  borderColor?: string;
  // Добавляем новые свойства, которые используются в компонентах
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  spellLevels?: Record<number, string>;
}

// Определения тем для приложения
export const themes: Record<string, Theme> = {
  default: {
    background: '#121212',
    foreground: '#1a1a1a',
    primary: '#8B5A2B',
    accent: '#8B5A2B',
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    inputBackground: 'rgba(0, 0, 0, 0.85)',
    buttonText: '#FFFFFF',
    borderColor: '#8B5A2B',
    backgroundBrightness: 0.7,
    decorativeCorners: false,
    spellLevels: {
      0: '#6b7280', // gray-500
      1: '#3b82f6', // blue-500
      2: '#8b5cf6', // violet-500
      3: '#ec4899', // pink-500
      4: '#f97316', // orange-500
      5: '#ef4444', // red-500
      6: '#14b8a6', // teal-500
      7: '#6366f1', // indigo-500
      8: '#ca8a04', // yellow-600
      9: '#059669'  // emerald-600
    }
  },
  warlock: {
    background: '#1E1A2B',
    foreground: '#2A1E40',
    primary: '#9061F9',
    accent: '#9061F9',
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(20, 15, 30, 0.9)',
    inputBackground: 'rgba(20, 15, 30, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#9061F9',
    backgroundBrightness: 0.5,
    backgroundGradient: 'linear-gradient(to bottom, rgba(30, 26, 43, 0.8), rgba(20, 15, 30, 0.9))',
    decorativeCorners: true,
    spellLevels: {
      0: '#6b7280', // gray-500
      1: '#9061F9', // theme accent
      2: '#a78bfa', // violet-400
      3: '#c4b5fd', // violet-300
      4: '#8b5cf6', // violet-500
      5: '#7c3aed', // violet-600
      6: '#6d28d9', // violet-700
      7: '#5b21b6', // violet-800
      8: '#4c1d95', // violet-900
      9: '#2e1065'  // violet-950
    }
  },
  wizard: {
    background: '#152238',
    foreground: '#1E3054',
    primary: '#3B82F6',
    accent: '#3B82F6', 
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(15, 25, 40, 0.9)',
    inputBackground: 'rgba(15, 25, 40, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#3B82F6',
    backgroundBrightness: 0.6,
    backgroundGradient: 'linear-gradient(to bottom, rgba(21, 34, 56, 0.8), rgba(15, 25, 40, 0.9))',
    decorativeCorners: true,
    spellLevels: {
      0: '#6b7280', // gray-500
      1: '#3B82F6', // theme accent
      2: '#60a5fa', // blue-400
      3: '#93c5fd', // blue-300
      4: '#2563eb', // blue-600
      5: '#1d4ed8', // blue-700
      6: '#1e40af', // blue-800
      7: '#1e3a8a', // blue-900
      8: '#172554', // blue-950
      9: '#0f172a'  // slate-950
    }
  },
  druid: {
    background: '#1B2D25',
    foreground: '#1E3A2B',
    primary: '#10B981',
    accent: '#10B981',
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(15, 30, 25, 0.9)',
    inputBackground: 'rgba(15, 30, 25, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#10B981',
    backgroundBrightness: 0.8,
    backgroundGradient: 'linear-gradient(to bottom, rgba(27, 45, 37, 0.8), rgba(15, 30, 25, 0.9))',
    decorativeCorners: true,
    spellLevels: {
      0: '#6b7280', // gray-500
      1: '#10B981', // theme accent
      2: '#34d399', // emerald-400
      3: '#6ee7b7', // emerald-300
      4: '#059669', // emerald-600
      5: '#047857', // emerald-700
      6: '#065f46', // emerald-800
      7: '#064e3b', // emerald-900
      8: '#022c22', // emerald-950
      9: '#064e3b'  // emerald-900
    }
  },
  warrior: {
    background: '#321E1E',
    foreground: '#4A2A2A',
    primary: '#F43F5E',
    accent: '#F43F5E',
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(35, 20, 20, 0.9)',
    inputBackground: 'rgba(35, 20, 20, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#F43F5E',
    backgroundBrightness: 0.6,
    backgroundGradient: 'linear-gradient(to bottom, rgba(50, 30, 30, 0.8), rgba(35, 20, 20, 0.9))',
    decorativeCorners: false,
    spellLevels: {
      0: '#6b7280', // gray-500
      1: '#F43F5E', // theme accent
      2: '#fb7185', // rose-400
      3: '#fda4af', // rose-300
      4: '#e11d48', // rose-600
      5: '#be123c', // rose-700
      6: '#9f1239', // rose-800
      7: '#881337', // rose-900
      8: '#4c0519', // rose-950
      9: '#881337'  // rose-900
    }
  },
  bard: {
    background: '#322815',
    foreground: '#403219',
    primary: '#F59E0B',
    accent: '#F59E0B',
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(35, 28, 15, 0.9)',
    inputBackground: 'rgba(35, 28, 15, 0.9)',
    buttonText: '#FFFFFF',
    borderColor: '#F59E0B',
    backgroundBrightness: 0.7,
    backgroundGradient: 'linear-gradient(to bottom, rgba(50, 40, 21, 0.8), rgba(35, 28, 15, 0.9))',
    decorativeCorners: true,
    spellLevels: {
      0: '#6b7280', // gray-500
      1: '#F59E0B', // theme accent
      2: '#fbbf24', // amber-400
      3: '#fcd34d', // amber-300
      4: '#d97706', // amber-600
      5: '#b45309', // amber-700
      6: '#92400e', // amber-800
      7: '#78350f', // amber-900
      8: '#451a03', // amber-950
      9: '#78350f'  // amber-900
    }
  }
};
