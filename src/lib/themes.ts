
export interface Theme {
  name: string;
  label: string;
  accent: string;
  accentSecondary?: string;
  glow?: string;
  textColor: string;
  mutedTextColor?: string;
  background?: string;
  cardBackground?: string;
  buttonText?: string;
  primary?: string;
  badge?: {
    cantrip?: string;
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level5?: string;
    level6?: string;
    level7?: string;
    level8?: string;
    level9?: string;
  } | string;
  spellLevels?: {
    [key: number]: string;
    0: string; // Cantrips
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
  };
}

export const themes: { [key: string]: Theme } = {
  default: {
    name: "default",
    label: "Default",
    accent: "#7dd3fc",
    glow: '0 0 10px rgba(125, 211, 252, 0.5)',
    textColor: "#f8fafc",
    mutedTextColor: '#9ca3af',
    background: '#1e293b',
    cardBackground: '#334155',
    buttonText: "#FFFFFF",
    primary: "#7dd3fc",
    badge: "#334155",
    spellLevels: {
      0: '#a8b2ba',
      1: '#93c5fd',
      2: '#60a5fa',
      3: '#3b82f6',
      4: '#2563eb',
      5: '#1d4ed8',
      6: '#1e3a8a',
      7: '#3730a3',
      8: '#4c1d95',
      9: '#4f46e5',
    },
  },
  dark: {
    name: "dark",
    label: "Dark",
    accent: "#4f46e5",
    glow: '0 0 10px rgba(79, 70, 229, 0.5)',
    textColor: "#f8fafc",
    mutedTextColor: '#9ca3af',
    background: '#0f172a',
    cardBackground: '#1e293b',
    buttonText: "#FFFFFF",
    primary: "#4f46e5",
    badge: "#1e293b",
    spellLevels: {
      0: '#a8b2ba',
      1: '#8b5cf6',
      2: '#7c3aed',
      3: '#6d28d9',
      4: '#5b21b6',
      5: '#4c1d95',
      6: '#4338ca',
      7: '#3730a3',
      8: '#312e81',
      9: '#2563eb',
    },
  },
  forest: {
    name: "forest",
    label: "Forest",
    accent: "#22c55e",
    glow: '0 0 10px rgba(34, 197, 94, 0.5)',
    textColor: "#f0fdf4",
    mutedTextColor: '#a7f3d0',
    background: '#15803d',
    cardBackground: '#166534',
    buttonText: "#FFFFFF",
    primary: "#22c55e",
    badge: "#166534",
    spellLevels: {
      0: '#a8b2ba',
      1: '#a7f3d0',
      2: '#74c476',
      3: '#4caf50',
      4: '#388e3c',
      5: '#2e7d32',
      6: '#22c55e',
      7: '#16a34a',
      8: '#15803d',
      9: '#14532d',
    },
  },
  lofi: {
    name: "lofi",
    label: "Lo-Fi",
    accent: "#a855f7",
    glow: '0 0 10px rgba(168, 85, 247, 0.5)',
    textColor: "#f5f3ff",
    mutedTextColor: '#ddd6fe',
    background: '#4c1d95',
    cardBackground: '#5b21b6',
    buttonText: "#FFFFFF",
    primary: "#a855f7",
    badge: "#5b21b6",
    spellLevels: {
      0: '#a8b2ba',
      1: '#ddd6fe',
      2: '#c4b5fd',
      3: '#a78bfa',
      4: '#8b5cf6',
      5: '#7c3aed',
      6: '#6d28d9',
      7: '#5b21b6',
      8: '#4c1d95',
      9: '#4338ca',
    },
  },
  dracula: {
    name: "dracula",
    label: "Dracula",
    accent: "#ff79c6",
    glow: '0 0 10px rgba(255, 121, 198, 0.5)',
    textColor: "#f8f8f2",
    mutedTextColor: '#6272a4',
    background: '#282a36',
    cardBackground: '#44475a',
    buttonText: "#FFFFFF",
    primary: "#ff79c6",
    badge: "#44475a",
    spellLevels: {
      0: '#a8b2ba',
      1: '#f8f8f2',
      2: '#ff79c6',
      3: '#bd93f9',
      4: '#6272a4',
      5: '#44475a',
      6: '#282a36',
      7: '#8be9fd',
      8: '#50fa7b',
      9: '#ffb86c',
    },
  },
  nord: {
    name: "nord",
    label: "Nord",
    accent: "#81a1c1",
    textColor: "#d8dee9",
    mutedTextColor: '#a3be8c',
    background: '#2e3440',
    cardBackground: '#3b4252',
    buttonText: "#FFFFFF",
    primary: "#81a1c1",
    badge: "#3b4252",
    spellLevels: {
      0: '#a8b2ba',
      1: '#81a1c1',
      2: '#88c0d0',
      3: '#8fbcbb',
      4: '#a3be8c',
      5: '#b48ead',
      6: '#d08770',
      7: '#bf616a',
      8: '#d8dee9',
      9: '#2e3440',
    },
  },
  cyberpunk: {
    name: "cyberpunk",
    label: "Cyberpunk",
    accent: "#e91e63",
    textColor: "#fff",
    mutedTextColor: '#64ffda',
    background: '#121212',
    cardBackground: '#212121',
    buttonText: "#FFFFFF",
    primary: "#e91e63",
    badge: "#212121",
    spellLevels: {
      0: '#a8b2ba',
      1: '#64ffda',
      2: '#e91e63',
      3: '#9c27b0',
      4: '#3f51b5',
      5: '#2196f3',
      6: '#03a9f4',
      7: '#00bcd4',
      8: '#009688',
      9: '#4caf50',
    },
  },
};
