export interface Theme {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  cardBackground: string;
  textColor: string;
  borderColor: string;
  muted: string;
  spellLevels?: {
    [key: number]: string;
  };
  buttonText?: string;
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
  primary?: string;
  buttonText?: string;
}

// Интерфейс для всех тем
export interface Themes {
  [key: string]: Theme;
}

// Определение тем
export const themes: Themes = {
  default: {
    name: "Темный",
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    primary: "#89b4fa",
    secondary: "#74c7ec",
    accent: "#f5c2e7",
    cardBackground: "rgba(30, 30, 46, 0.85)",
    textColor: "#cdd6f4",
    borderColor: "#313244",
    muted: "#45475a",
    buttonText: "#fff",
    spellLevels: {
      0: "#6b7280", // Заговор
      1: "#10b981", // 1 уровень
      2: "#3b82f6", // 2 уровень
      3: "#8b5cf6", // 3 уровень
      4: "#ec4899", // 4 уровень
      5: "#f59e0b", // 5 уровень
      6: "#ef4444", // 6 уровень
      7: "#6366f1", // 7 уровень
      8: "#0ea5e9", // 8 уровень
      9: "#7c3aed"  // 9 уровень
    },
    badge: {
      cantrip: "#6b7280",
      level1: "#10b981",
      level2: "#3b82f6",
      level3: "#8b5cf6",
      level4: "#ec4899",
      level5: "#f59e0b",
      level6: "#ef4444",
      level7: "#6366f1",
      level8: "#0ea5e9",
      level9: "#7c3aed"
    },
  },
  
  dracula: {
    name: "Dracula",
    background: "#282a36",
    foreground: "#f8f8f2",
    primary: "#bd93f9",
    secondary: "#ff79c6",
    accent: "#ffb86c",
    cardBackground: "rgba(40, 42, 54, 0.85)",
    textColor: "#f8f8f2",
    borderColor: "#44475a",
    muted: "#6272a4",
    buttonText: "#fff",
    spellLevels: {
      0: "#6272a4",
      1: "#8be9fd",
      2: "#50fa7b",
      3: "#f1fa8c",
      4: "#ff79c6",
      5: "#ff5555",
      6: "#bd93f9",
      7: "#66d9ef",
      8: "#44475a",
      9: "#f8f8f2"
    },
    badge: {
      cantrip: "#6272a4",
      level1: "#8be9fd",
      level2: "#50fa7b",
      level3: "#f1fa8c",
      level4: "#ff79c6",
      level5: "#ff5555",
      level6: "#bd93f9",
      level7: "#66d9ef",
      level8: "#44475a",
      level9: "#f8f8f2"
    },
  },
  
  nord: {
    name: "Nord",
    background: "#2e3440",
    foreground: "#d8dee9",
    primary: "#81a1c1",
    secondary: "#8fbcbb",
    accent: "#b48ead",
    cardBackground: "rgba(46, 52, 64, 0.85)",
    textColor: "#d8dee9",
    borderColor: "#434c5e",
    muted: "#4c566a",
    buttonText: "#fff",
    spellLevels: {
      0: "#4c566a",
      1: "#8fbcbb",
      2: "#a3be8c",
      3: "#ebcb8b",
      4: "#d08770",
      5: "#bf616a",
      6: "#81a1c1",
      7: "#5e81ac",
      8: "#434c5e",
      9: "#d8dee9"
    },
    badge: {
      cantrip: "#4c566a",
      level1: "#8fbcbb",
      level2: "#a3be8c",
      level3: "#ebcb8b",
      level4: "#d08770",
      level5: "#bf616a",
      level6: "#81a1c1",
      level7: "#5e81ac",
      level8: "#434c5e",
      level9: "#d8dee9"
    },
  },
  
  gruvbox: {
    name: "Gruvbox",
    background: "#282828",
    foreground: "#ebdbb2",
    primary: "#83a598",
    secondary: "#d3869b",
    accent: "#fabd2f",
    cardBackground: "rgba(40, 40, 40, 0.85)",
    textColor: "#ebdbb2",
    borderColor: "#3c3836",
    muted: "#665c54",
    buttonText: "#282828",
    spellLevels: {
      0: "#665c54",
      1: "#98971a",
      2: "#b16286",
      3: "#d65d0e",
      4: "#af3a03",
      5: "#9d0006",
      6: "#79740e",
      7: "#427b58",
      8: "#3c3836",
      9: "#ebdbb2"
    },
    badge: {
      cantrip: "#665c54",
      level1: "#98971a",
      level2: "#b16286",
      level3: "#d65d0e",
      level4: "#af3a03",
      level5: "#9d0006",
      level6: "#79740e",
      level7: "#427b58",
      level8: "#3c3836",
      level9: "#ebdbb2"
    },
  },
  
  catppuccin: {
    name: "Catppuccin",
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    primary: "#89b4fa",
    secondary: "#f38ba8",
    accent: "#a6adc7",
    cardBackground: "rgba(30, 30, 46, 0.85)",
    textColor: "#cdd6f4",
    borderColor: "#313244",
    muted: "#45475a",
    buttonText: "#fff",
    spellLevels: {
      0: "#45475a",
      1: "#94e2d5",
      2: "#89dceb",
      3: "#74c7ec",
      4: "#89b4fa",
      5: "#b4befe",
      6: "#cba6f7",
      7: "#f5c2e7",
      8: "#f38ba8",
      9: "#eba0ac"
    },
     badge: {
      cantrip: "#45475a",
      level1: "#94e2d5",
      level2: "#89dceb",
      level3: "#74c7ec",
      level4: "#89b4fa",
      level5: "#b4befe",
      level6: "#cba6f7",
      level7: "#f5c2e7",
      level8: "#f38ba8",
      level9: "#eba0ac"
    },
  },
};

export type ThemeType = keyof typeof themes;
