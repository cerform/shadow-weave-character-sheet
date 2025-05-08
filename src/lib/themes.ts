
export interface ThemeColors {
  background: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  highlight: string;
  // Add the missing properties
  foreground: string;
  primary: string;
  buttonText: string;
}

export const themes: Record<string, ThemeColors> = {
  default: {
    background: '#1f2937',
    cardBackground: '#111827',
    textColor: '#f9fafb', 
    mutedTextColor: '#9ca3af',
    accent: '#4f46e5',  // индиго
    success: '#10b981', // зеленый
    warning: '#f59e0b', // желтый
    danger: '#ef4444',  // красный
    highlight: '#8b5cf6', // фиолетовый
    // Add the missing properties
    foreground: '#f9fafb',
    primary: '#4f46e5',
    buttonText: '#ffffff'
  },
  dark: {
    background: '#0f172a',
    cardBackground: '#020617',
    textColor: '#e2e8f0',
    mutedTextColor: '#94a3b8',
    accent: '#3b82f6',  // синий
    success: '#22c55e', // зеленый
    warning: '#eab308', // желтый
    danger: '#dc2626',  // красный
    highlight: '#8b5cf6', // фиолетовый
    // Add the missing properties
    foreground: '#e2e8f0',
    primary: '#3b82f6',
    buttonText: '#ffffff'
  },
  fantasy: {
    background: '#1e1b4b',
    cardBackground: '#0f172a',
    textColor: '#e0e7ff',
    mutedTextColor: '#a5b4fc',
    accent: '#6d28d9',  // фиолетовый
    success: '#15803d', // зеленый
    warning: '#a16207', // янтарный
    danger: '#b91c1c',  // красный
    highlight: '#0284c7', // голубой
    // Add the missing properties
    foreground: '#e0e7ff',
    primary: '#6d28d9',
    buttonText: '#ffffff'
  },
  cyberpunk: {
    background: '#18181b',
    cardBackground: '#09090b',
    textColor: '#fafafa',
    mutedTextColor: '#a1a1aa',
    accent: '#f43f5e',  // розовый
    success: '#059669', // изумрудный
    warning: '#d97706', // оранжевый  
    danger: '#b91c1c',  // красный
    highlight: '#06b6d4', // бирюзовый
    // Add the missing properties
    foreground: '#fafafa',
    primary: '#f43f5e',
    buttonText: '#ffffff'
  },
  forest: {
    background: '#1c2f1d',
    cardBackground: '#0a190b',
    textColor: '#e8f5e9',
    mutedTextColor: '#a5d6a7',
    accent: '#4caf50',  // зеленый
    success: '#2e7d32', // темно-зеленый
    warning: '#f57f17', // оранжевый
    danger: '#c62828',  // красный
    highlight: '#0277bd', // синий
    // Add the missing properties
    foreground: '#e8f5e9',
    primary: '#4caf50',
    buttonText: '#ffffff'
  }
};
