
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
  },
  light: {
    background: '#FFFFFF',
    foreground: '#1A202C',
    textColor: '#1A202C',
    mutedTextColor: '#64748B',
    accent: '#8B5CF6',
    primary: '#8B5CF6',
    secondary: '#6366F1',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#E2E8F0',
    backgroundBrightness: 0.9,
    backgroundGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    decorativeCorners: false
  },
  warlock: {
    background: '#0D0B1E',
    foreground: '#E2B5F0',
    textColor: '#E2B5F0',
    mutedTextColor: '#A855F7',
    accent: '#A855F7',
    primary: '#A855F7',
    secondary: '#7C3AED',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(139, 69, 19, 0.2)',
    borderColor: '#7C2D12',
    backgroundBrightness: 0.2,
    backgroundGradient: 'linear-gradient(135deg, #0D0B1E 0%, #2D1B69 100%)',
    decorativeCorners: true
  },
  wizard: {
    background: '#0C1445',
    foreground: '#93C5FD',
    textColor: '#93C5FD',
    mutedTextColor: '#60A5FA',
    accent: '#3B82F6',
    primary: '#3B82F6',
    secondary: '#2563EB',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#1E40AF',
    backgroundBrightness: 0.25,
    backgroundGradient: 'linear-gradient(135deg, #0C1445 0%, #1E3A8A 100%)',
    decorativeCorners: true
  },
  druid: {
    background: '#0F2A0A',
    foreground: '#86EFAC',
    textColor: '#86EFAC',
    mutedTextColor: '#4ADE80',
    accent: '#22C55E',
    primary: '#22C55E',
    secondary: '#16A34A',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#166534',
    backgroundBrightness: 0.3,
    backgroundGradient: 'linear-gradient(135deg, #0F2A0A 0%, #365314 100%)',
    decorativeCorners: true
  },
  warrior: {
    background: '#2D1B0A',
    foreground: '#FCD34D',
    textColor: '#FCD34D',
    mutedTextColor: '#F59E0B',
    accent: '#F59E0B',
    primary: '#F59E0B',
    secondary: '#D97706',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#92400E',
    backgroundBrightness: 0.25,
    backgroundGradient: 'linear-gradient(135deg, #2D1B0A 0%, #78350F 100%)',
    decorativeCorners: true
  },
  bard: {
    background: '#4C1D95',
    foreground: '#E879F9',
    textColor: '#E879F9',
    mutedTextColor: '#D946EF',
    accent: '#D946EF',
    primary: '#D946EF',
    secondary: '#C026D3',
    buttonText: '#FFFFFF',
    cardBackground: 'rgba(217, 70, 239, 0.1)',
    borderColor: '#A21CAF',
    backgroundBrightness: 0.3,
    backgroundGradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
    decorativeCorners: true
  }
};

export type ThemeName = keyof typeof themes;
