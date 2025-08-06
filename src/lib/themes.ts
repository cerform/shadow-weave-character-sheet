
export interface Theme {
  background: string;
  foreground: string;
  textColor: string;
  mutedTextColor: string;
  accent: string;
  primary: string;
  secondary: string;
  buttonText: string;
  cardBackground: string;
  borderColor: string;
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
}

export const themes: Record<string, Theme> = {
  // Темная тема по умолчанию
  default: {
    background: '#0F0F23',
    foreground: '#E2E8F0',
    textColor: '#E2E8F0',
    mutedTextColor: '#94A3B8',
    accent: '#8B5CF6',
    primary: '#8B5CF6',
    secondary: '#6366F1',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.4)',
    borderColor: '#374151',
    backgroundBrightness: 0.3,
    backgroundGradient: 'linear-gradient(135deg, #0F0F23 0%, #1E1B4B 100%)',
    decorativeCorners: true
  },
  
  // Фиолетовый + Черный с глоу эффектами
  shadow: {
    background: '#0A0A0A',
    foreground: '#E5CCFF',
    textColor: '#E5CCFF',
    mutedTextColor: '#B794F6',
    accent: '#9F7AEA',
    primary: '#805AD5',
    secondary: '#6B46C1',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(159, 122, 234, 0.1)',
    borderColor: '#553C9A',
    backgroundBrightness: 0.1,
    backgroundGradient: 'linear-gradient(135deg, #0A0A0A 0%, #2D1B69 50%, #0A0A0A 100%)',
    decorativeCorners: true
  },
  
  // Голубой + Белый
  frost: {
    background: '#F0F9FF',
    foreground: '#0C4A6E',
    textColor: '#0C4A6E',
    mutedTextColor: '#0369A1',
    accent: '#0EA5E9',
    primary: '#0284C7',
    secondary: '#0369A1',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(14, 165, 233, 0.1)',
    borderColor: '#0284C7',
    backgroundBrightness: 0.95,
    backgroundGradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
    decorativeCorners: false
  },

  // Желтый + Красный (Огненный)
  flame: {
    background: '#1A0B08',
    foreground: '#FFEDD5',
    textColor: '#FFEDD5',
    mutedTextColor: '#FB923C',
    accent: '#F97316',
    primary: '#EA580C',
    secondary: '#DC2626',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#C2410C',
    backgroundBrightness: 0.2,
    backgroundGradient: 'linear-gradient(135deg, #1A0B08 0%, #7C2D12 30%, #DC2626 70%, #7C2D12 100%)',
    decorativeCorners: true
  },

  // Изумрудный + Черный
  emerald: {
    background: '#022C22',
    foreground: '#A7F3D0',
    textColor: '#A7F3D0',
    mutedTextColor: '#6EE7B7',
    accent: '#10B981',
    primary: '#059669',
    secondary: '#047857',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#065F46',
    backgroundBrightness: 0.25,
    backgroundGradient: 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #022C22 100%)',
    decorativeCorners: true
  },

  // Розовый + Фиолетовый (Магический)
  mystic: {
    background: '#2E1065',
    foreground: '#FBBF24',
    textColor: '#FBBF24',
    mutedTextColor: '#F59E0B',
    accent: '#EC4899',
    primary: '#DB2777',
    secondary: '#BE185D',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(236, 72, 153, 0.15)',
    borderColor: '#9D174D',
    backgroundBrightness: 0.3,
    backgroundGradient: 'linear-gradient(135deg, #2E1065 0%, #7C3AED 30%, #EC4899 70%, #2E1065 100%)',
    decorativeCorners: true
  },

  // Темно-синий + Серебряный
  steel: {
    background: '#0F172A',
    foreground: '#F1F5F9',
    textColor: '#F1F5F9',
    mutedTextColor: '#CBD5E1',
    accent: '#64748B',
    primary: '#475569',
    secondary: '#334155',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#475569',
    backgroundBrightness: 0.2,
    backgroundGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
    decorativeCorners: true
  },

  // Золотой + Коричневый (Дварфский)
  bronze: {
    background: '#1C1917',
    foreground: '#FED7AA',
    textColor: '#FED7AA',
    mutedTextColor: '#FDBA74',
    accent: '#F59E0B',
    primary: '#D97706',
    secondary: '#B45309',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#92400E',
    backgroundBrightness: 0.25,
    backgroundGradient: 'linear-gradient(135deg, #1C1917 0%, #451A03 30%, #92400E 70%, #1C1917 100%)',
    decorativeCorners: true
  },

  // Темный (оригинальный)
  dark: {
    background: '#0F0F23',
    foreground: '#E2E8F0',
    textColor: '#E2E8F0',
    mutedTextColor: '#94A3B8',
    accent: '#8B5CF6',
    primary: '#8B5CF6',
    secondary: '#6366F1',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(0, 0, 0, 0.4)',
    borderColor: '#374151',
    backgroundBrightness: 0.3,
    backgroundGradient: 'linear-gradient(135deg, #0F0F23 0%, #1E1B4B 100%)',
    decorativeCorners: true
  }
};

export type ThemeName = keyof typeof themes;
