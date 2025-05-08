
export interface Theme {
  background: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  accent: string;
  accentHover: string;
  borderColor: string;
  buttonBackground: string;
  buttonText: string;
  danger: string;
  success: string;
  warning: string;
}

export const themes: Record<string, Theme> = {
  default: {
    background: '#121212',
    cardBackground: '#1e1e1e',
    textColor: '#e0e0e0',
    mutedTextColor: '#a0a0a0',
    accent: '#3f51b5',
    accentHover: '#303f9f',
    borderColor: '#2a2a2a',
    buttonBackground: '#3f51b5',
    buttonText: '#ffffff',
    danger: '#f44336',
    success: '#4caf50',
    warning: '#ff9800'
  },
  light: {
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    textColor: '#212121',
    mutedTextColor: '#757575',
    accent: '#3f51b5',
    accentHover: '#303f9f',
    borderColor: '#e0e0e0',
    buttonBackground: '#3f51b5',
    buttonText: '#ffffff',
    danger: '#f44336',
    success: '#4caf50',
    warning: '#ff9800'
  },
  dark: {
    background: '#121212',
    cardBackground: '#1e1e1e',
    textColor: '#e0e0e0',
    mutedTextColor: '#a0a0a0',
    accent: '#bb86fc',
    accentHover: '#9f66f2',
    borderColor: '#2a2a2a',
    buttonBackground: '#bb86fc',
    buttonText: '#000000',
    danger: '#cf6679',
    success: '#03dac6',
    warning: '#ffb74d'
  },
  sepia: {
    background: '#f4ecd8',
    cardBackground: '#fff8e7',
    textColor: '#5d4037',
    mutedTextColor: '#8d6e63',
    accent: '#bf360c',
    accentHover: '#8c2704',
    borderColor: '#d7cbb9',
    buttonBackground: '#bf360c',
    buttonText: '#ffffff',
    danger: '#c62828',
    success: '#2e7d32',
    warning: '#ef6c00'
  },
  fantasy: {
    background: '#2c3e50',
    cardBackground: '#34495e',
    textColor: '#ecf0f1',
    mutedTextColor: '#bdc3c7',
    accent: '#8e44ad',
    accentHover: '#6c3483',
    borderColor: '#2a3b4c',
    buttonBackground: '#8e44ad',
    buttonText: '#ffffff',
    danger: '#c0392b',
    success: '#27ae60',
    warning: '#f39c12'
  }
};

export default themes;
