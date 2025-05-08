
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  textColor: string;
  mutedTextColor: string;
  cardBackground: string;
  buttonText: string;
}

export const themes: Record<string, Theme> = {
  default: {
    primary: '#7C3AED',
    secondary: '#5B21B6',
    accent: '#C084FC',
    background: '#1E1E1E',
    foreground: '#FFFFFF',
    textColor: '#FFFFFF',
    mutedTextColor: '#A1A1AA',
    cardBackground: '#27272A',
    buttonText: '#FFFFFF'
  },
  dark: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#60A5FA',
    background: '#111111',
    foreground: '#FFFFFF',
    textColor: '#FFFFFF',
    mutedTextColor: '#A1A1AA',
    cardBackground: '#1F1F23',
    buttonText: '#FFFFFF'
  },
  light: {
    primary: '#EC4899',
    secondary: '#BE185D',
    accent: '#F472B6',
    background: '#F9FAFB',
    foreground: '#111827',
    textColor: '#111827',
    mutedTextColor: '#6B7280',
    cardBackground: '#FFFFFF',
    buttonText: '#FFFFFF'
  },
  fantasy: {
    primary: '#D97706',
    secondary: '#92400E',
    accent: '#FBBF24',
    background: '#292524',
    foreground: '#FAFAF9',
    textColor: '#FAFAF9',
    mutedTextColor: '#D6D3D1',
    cardBackground: '#44403C',
    buttonText: '#FFFFFF'
  },
  warlock: {
    primary: '#9333EA',
    secondary: '#7E22CE',
    accent: '#A855F7',
    background: '#0F172A',
    foreground: '#E2E8F0',
    textColor: '#E2E8F0',
    mutedTextColor: '#94A3B8',
    cardBackground: '#1E293B',
    buttonText: '#FFFFFF'
  },
  wizard: {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#3B82F6',
    background: '#0C0A3E',
    foreground: '#EEF2FF',
    textColor: '#EEF2FF',
    mutedTextColor: '#C7D2FE',
    cardBackground: '#1E1B4B',
    buttonText: '#FFFFFF'
  },
  druid: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
    background: '#064E3B',
    foreground: '#ECFDF5',
    textColor: '#ECFDF5',
    mutedTextColor: '#A7F3D0',
    cardBackground: '#065F46',
    buttonText: '#FFFFFF'
  },
  warrior: {
    primary: '#B91C1C',
    secondary: '#991B1B',
    accent: '#EF4444',
    background: '#450A0A',
    foreground: '#FEF2F2',
    textColor: '#FEF2F2',
    mutedTextColor: '#FECACA',
    cardBackground: '#7F1D1D',
    buttonText: '#FFFFFF'
  },
  bard: {
    primary: '#C026D3',
    secondary: '#A21CAF',
    accent: '#E879F9',
    background: '#4A044E',
    foreground: '#FAF5FF',
    textColor: '#FAF5FF',
    mutedTextColor: '#E9D5FF',
    cardBackground: '#701A75',
    buttonText: '#FFFFFF'
  },
};

export default themes;
