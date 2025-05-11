
export interface ThemeStyles {
  background: string;
  cardBackground: string;
  textColor: string;
  accentTextColor: string;
  buttonText: string;
  borderColor: string;
  accent: string;
  shadowColor: string;
  fontFamily?: string;
}

export type ThemeType = 'light' | 'dark' | 'warlock' | 'wizard' | 'bard' | 'druid' | 'cleric' | 'paladin' | 'rogue' | 'ranger' | 'barbarian' | 'monk' | 'fighter' | 'sorcerer';

// Define themes
export const themes: Record<ThemeType, ThemeStyles> = {
  light: {
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    textColor: '#222222',
    accentTextColor: '#6366f1',
    buttonText: '#ffffff',
    borderColor: '#e2e8f0',
    accent: '#6366f1',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, sans-serif'
  },
  dark: {
    background: '#0f172a',
    cardBackground: '#1e293b',
    textColor: '#e2e8f0',
    accentTextColor: '#818cf8',
    buttonText: '#ffffff',
    borderColor: '#334155',
    accent: '#818cf8',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'system-ui, sans-serif'
  },
  warlock: {
    background: '#18181b',
    cardBackground: '#27272a',
    textColor: '#fafafa',
    accentTextColor: '#d946ef',
    buttonText: '#ffffff',
    borderColor: '#3f3f46',
    accent: '#d946ef',
    shadowColor: 'rgba(217, 70, 239, 0.3)',
    fontFamily: '"Cinzel", serif'
  },
  wizard: {
    background: '#0c0a20',
    cardBackground: '#1a1a3a',
    textColor: '#e2e8f0',
    accentTextColor: '#60a5fa',
    buttonText: '#ffffff',
    borderColor: '#2d2b42',
    accent: '#60a5fa',
    shadowColor: 'rgba(96, 165, 250, 0.3)',
    fontFamily: '"Lora", serif'
  },
  // ... add the rest of the themes with all required properties
  bard: {
    background: '#2d1b36',
    cardBackground: '#432352',
    textColor: '#fdf6fd',
    accentTextColor: '#f9a8d4',
    buttonText: '#ffffff',
    borderColor: '#583168',
    accent: '#f9a8d4',
    shadowColor: 'rgba(249, 168, 212, 0.3)',
    fontFamily: '"Dancing Script", cursive'
  },
  druid: {
    background: '#064e3b',
    cardBackground: '#115e59',
    textColor: '#ecfdf5',
    accentTextColor: '#6ee7b7',
    buttonText: '#064e3b',
    borderColor: '#0f766e',
    accent: '#6ee7b7',
    shadowColor: 'rgba(110, 231, 183, 0.3)',
    fontFamily: '"Fauna One", serif'
  },
  cleric: {
    background: '#3f3f46',
    cardBackground: '#52525b',
    textColor: '#fafafa',
    accentTextColor: '#e4e4e7',
    buttonText: '#18181b',
    borderColor: '#71717a',
    accent: '#e4e4e7',
    shadowColor: 'rgba(228, 228, 231, 0.3)',
    fontFamily: '"Cormorant Garamond", serif'
  },
  paladin: {
    background: '#172554',
    cardBackground: '#1e3a8a',
    textColor: '#f8fafc',
    accentTextColor: '#fcd34d',
    buttonText: '#000000',
    borderColor: '#1e40af',
    accent: '#fcd34d',
    shadowColor: 'rgba(252, 211, 77, 0.3)',
    fontFamily: '"Cinzel", serif'
  },
  rogue: {
    background: '#18181b',
    cardBackground: '#27272a',
    textColor: '#d4d4d8',
    accentTextColor: '#9f1239',
    buttonText: '#f8fafc',
    borderColor: '#3f3f46',
    accent: '#9f1239',
    shadowColor: 'rgba(159, 18, 57, 0.3)',
    fontFamily: '"Roboto Condensed", sans-serif'
  },
  ranger: {
    background: '#1c1917',
    cardBackground: '#292524',
    textColor: '#e7e5e4',
    accentTextColor: '#84cc16',
    buttonText: '#1c1917',
    borderColor: '#44403c',
    accent: '#84cc16',
    shadowColor: 'rgba(132, 204, 22, 0.3)',
    fontFamily: '"Roboto Slab", serif'
  },
  barbarian: {
    background: '#7f1d1d',
    cardBackground: '#991b1b',
    textColor: '#fef2f2',
    accentTextColor: '#fbbf24',
    buttonText: '#7f1d1d',
    borderColor: '#b91c1c',
    accent: '#fbbf24',
    shadowColor: 'rgba(251, 191, 36, 0.3)',
    fontFamily: '"Fjalla One", sans-serif'
  },
  monk: {
    background: '#1e293b',
    cardBackground: '#334155',
    textColor: '#f1f5f9',
    accentTextColor: '#c084fc',
    buttonText: '#1e1b4b',
    borderColor: '#475569',
    accent: '#c084fc',
    shadowColor: 'rgba(192, 132, 252, 0.3)',
    fontFamily: '"Noto Sans", sans-serif'
  },
  fighter: {
    background: '#374151',
    cardBackground: '#4b5563',
    textColor: '#f3f4f6',
    accentTextColor: '#f97316',
    buttonText: '#1f2937',
    borderColor: '#6b7280',
    accent: '#f97316',
    shadowColor: 'rgba(249, 115, 22, 0.3)',
    fontFamily: '"Roboto", sans-serif'
  },
  sorcerer: {
    background: '#4c1d95',
    cardBackground: '#581c87',
    textColor: '#f5f3ff',
    accentTextColor: '#fb7185',
    buttonText: '#ffffff',
    borderColor: '#7e22ce',
    accent: '#fb7185',
    shadowColor: 'rgba(251, 113, 133, 0.3)',
    fontFamily: '"Alegreya", serif'
  }
};

export default themes;
