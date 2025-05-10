
// Add these missing properties to the Theme interface
export interface Theme {
  name: string;
  background: string;
  foreground: string; 
  accent: string;
  primary: string;
  secondary: string;
  textColor: string;
  mutedTextColor: string;
  cardBackground: string;
  buttonText: string; // Make sure this is included in all theme objects
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  // Add these new properties
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  primaryColor?: string; // Alias for primary
}

export const themes: Record<string, Theme> = {
  default: {
    name: 'Default',
    primary: '#6b21a8',
    secondary: '#9333ea',
    accent: '#d8b4fe',
    background: '#1e1b4b',
    foreground: '#2e2b8a',
    textColor: '#e2e8f0',
    mutedTextColor: '#94a3b8',
    cardBackground: 'rgba(30, 27, 75, 0.8)',
    buttonText: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  },
  dark: {
    name: 'Dark',
    primary: '#334155',
    secondary: '#475569',
    accent: '#94a3b8',
    background: '#0f172a',
    foreground: '#1e293b',
    textColor: '#f1f5f9',
    mutedTextColor: '#94a3b8',
    cardBackground: 'rgba(15, 23, 42, 0.8)',
    buttonText: '#ffffff',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb'
  },
  light: {
    name: 'Light',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    background: '#f8fafc',
    foreground: '#f1f5f9',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
    cardBackground: 'rgba(248, 250, 252, 0.8)',
    buttonText: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  },
  fantasy: {
    name: 'Fantasy',
    primary: '#854d0e',
    secondary: '#a16207',
    accent: '#eab308',
    background: '#422006',
    foreground: '#713f12',
    textColor: '#fef3c7',
    mutedTextColor: '#d97706',
    cardBackground: 'rgba(66, 32, 6, 0.8)',
    buttonText: '#ffffff',
    success: '#14532d',
    warning: '#ca8a04',
    danger: '#991b1b',
    info: '#1e40af'
  },
  warlock: {
    name: 'Warlock',
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    background: '#2e1065',
    foreground: '#4c1d95',
    textColor: '#ede9fe',
    mutedTextColor: '#c4b5fd',
    cardBackground: 'rgba(46, 16, 101, 0.8)',
    buttonText: '#ffffff',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb'
  },
  wizard: {
    name: 'Wizard',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#93c5fd',
    background: '#172554',
    foreground: '#1e3a8a',
    textColor: '#dbeafe',
    mutedTextColor: '#60a5fa',
    cardBackground: 'rgba(23, 37, 84, 0.8)',
    buttonText: '#ffffff',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb'
  },
  druid: {
    name: 'Druid',
    primary: '#14532d',
    secondary: '#15803d',
    accent: '#84cc16',
    background: '#052e16',
    foreground: '#166534',
    textColor: '#dcfce7',
    mutedTextColor: '#4ade80',
    cardBackground: 'rgba(5, 46, 22, 0.8)',
    buttonText: '#ffffff',
    success: '#15803d',
    warning: '#ca8a04',
    danger: '#b91c1c',
    info: '#0369a1'
  },
  warrior: {
    name: 'Warrior',
    primary: '#9f1239',
    secondary: '#be123c',
    accent: '#f43f5e',
    background: '#4c0519',
    foreground: '#881337',
    textColor: '#fee2e2',
    mutedTextColor: '#f87171',
    cardBackground: 'rgba(76, 5, 25, 0.8)',
    buttonText: '#ffffff',
    success: '#15803d',
    warning: '#ca8a04',
    danger: '#b91c1c',
    info: '#0369a1'
  },
  bard: {
    name: 'Bard',
    primary: '#854d0e',
    secondary: '#b45309',
    accent: '#f59e0b',
    background: '#422006',
    foreground: '#713f12',
    textColor: '#fef3c7',
    mutedTextColor: '#fbbf24',
    cardBackground: 'rgba(66, 32, 6, 0.8)',
    buttonText: '#ffffff',
    success: '#15803d',
    warning: '#ca8a04',
    danger: '#b91c1c',
    info: '#0369a1'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#22d3ee',
    background: '#020617',
    foreground: '#0f172a',
    textColor: '#f0f9ff',
    mutedTextColor: '#67e8f9',
    cardBackground: 'rgba(2, 6, 23, 0.8)',
    buttonText: '#ecfeff',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb'
  }
};
