export interface Theme {
  name: string;
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  buttonText: string;
  border?: string;
  glow?: string;
  badge?: string;
  spellLevels?: {
    [key: number]: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    name: "По умолчанию",
    primary: "#075985",
    accent: "#0ea5e9",
    background: "#0f172a",
    foreground: "#ffffff",
    cardBackground: "rgba(15, 23, 42, 0.85)",
    textColor: "#ffffff",
    mutedTextColor: "#94a3b8",
    buttonText: "#ffffff",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  dark: {
    name: "Темная тема",
    primary: "#4ade80",
    accent: "#a7f3d0",
    background: "#1e293b",
    foreground: "#ffffff",
    cardBackground: "rgba(30, 41, 59, 0.85)",
    textColor: "#ffffff",
    mutedTextColor: "#cbd5e1",
    buttonText: "#000000",
    border: "#334158",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  light: {
    name: "Светлая тема",
    primary: "#075985",
    accent: "#0ea5e9",
    background: "#f8fafc",
    foreground: "#0f172a",
    cardBackground: "rgba(248, 250, 252, 0.85)",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    buttonText: "#ffffff",
    border: "#e2e8f0",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  cyberpunk: {
    name: "Киберпанк",
    primary: "#ff00ff",
    accent: "#00ffff",
    background: "#121212",
    foreground: "#ffffff",
    cardBackground: "rgba(0, 0, 0, 0.7)",
    textColor: "#ffffff",
    mutedTextColor: "#cccccc",
    buttonText: "#000000",
    border: "#333333",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  dracula: {
    name: "Дракула",
    primary: "#bd93f9",
    accent: "#f8f8f2",
    background: "#282a36",
    foreground: "#f8f8f2",
    cardBackground: "rgba(40, 42, 54, 0.85)",
    textColor: "#f8f8f2",
    mutedTextColor: "#6272a4",
    buttonText: "#000000",
    border: "#44475a",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  forest: {
    name: "Лесная",
    primary: "#6b8e23",
    accent: "#8fbc8f",
    background: "#228b22",
    foreground: "#f0fff0",
    cardBackground: "rgba(34, 139, 34, 0.85)",
    textColor: "#f0fff0",
    mutedTextColor: "#a9ba9d",
    buttonText: "#000000",
    border: "#556b2f",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  ocean: {
    name: "Океан",
    primary: "#1e90ff",
    accent: "#70a1ff",
    background: "#000080",
    foreground: "#ffffff",
    cardBackground: "rgba(0, 0, 128, 0.85)",
    textColor: "#ffffff",
    mutedTextColor: "#add8e6",
    buttonText: "#000000",
    border: "#4682b4",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  rose: {
    name: "Роза",
    primary: "#e91e63",
    accent: "#ff4081",
    background: "#c2185b",
    foreground: "#ffffff",
    cardBackground: "rgba(194, 24, 91, 0.85)",
    textColor: "#ffffff",
    mutedTextColor: "#f06292",
    buttonText: "#000000",
    border: "#ad1457",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  },
  sand: {
    name: "Песок",
    primary: "#f4a261",
    accent: "#e76f51",
    background: "#e9c46a",
    foreground: "#264653",
    cardBackground: "rgba(233, 196, 106, 0.85)",
    textColor: "#264653",
    mutedTextColor: "#818a91",
    buttonText: "#000000",
    border: "#d4a373",
    spellLevels: {
      0: "#6b7280", // Cantrips
      1: "#10b981",
      2: "#3b82f6",
      3: "#8b5cf6",
      4: "#ec4899",
      5: "#f59e0b",
      6: "#ef4444",
      7: "#6366f1",
      8: "#0ea5e9",
      9: "#7c3aed"
    }
  }
};
