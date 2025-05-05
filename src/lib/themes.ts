
// Интерфейс для темы
export interface Theme {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  secondary?: string;
  accent: string;
  textColor: string;
  cardBackground: string;
  glow?: string;
  mutedTextColor?: string;
  buttonText?: string;
  spellLevels?: {
    [level: number]: string;
  };
}

// Объект с доступными темами
export const themes: Record<string, Theme> = {
  default: {
    name: "Default",
    background: "#0f0f0f",
    foreground: "#1a1a1a",
    primary: "#8351a8",
    secondary: "#6a4087",
    accent: "#9969c7",
    textColor: "#ffffff",
    cardBackground: "rgba(26, 26, 26, 0.8)",
    glow: "0 0 10px rgba(153, 105, 199, 0.5)",
    mutedTextColor: "#9ca3af",
    buttonText: "#ffffff",
    spellLevels: {
      0: "#6b7280", // Заговоры
      1: "#10b981", // 1 уровень
      2: "#3b82f6", // 2 уровень
      3: "#8b5cf6", // 3 уровень
      4: "#ec4899", // 4 уровень
      5: "#f59e0b", // 5 уровень
      6: "#ef4444", // 6 уровень
      7: "#6366f1", // 7 уровень
      8: "#0ea5e9", // 8 уровень
      9: "#7c3aed"  // 9 уровень
    }
  },
  dark: {
    name: "Dark",
    background: "#121212",
    foreground: "#1e1e1e",
    primary: "#6b21a8",
    secondary: "#4a1578",
    accent: "#7928ca",
    textColor: "#e2e2e2",
    cardBackground: "rgba(30, 30, 30, 0.9)",
    glow: "0 0 8px rgba(121, 40, 202, 0.4)",
    mutedTextColor: "#9ca3af",
    buttonText: "#ffffff",
    spellLevels: {
      0: "#6b7280", // Заговоры
      1: "#10b981", // 1 уровень
      2: "#3b82f6", // 2 уровень
      3: "#8b5cf6", // 3 уровень
      4: "#ec4899", // 4 уровень
      5: "#f59e0b", // 5 уровень
      6: "#ef4444", // 6 уровень
      7: "#6366f1", // 7 уровень
      8: "#0ea5e9", // 8 уровень
      9: "#7c3aed"  // 9 уровень
    }
  },
  blood: {
    name: "Blood",
    background: "#1a0a0c",
    foreground: "#230d11",
    primary: "#9a0000",
    accent: "#c41e3a",
    textColor: "#f8d7da",
    cardBackground: "rgba(35, 13, 17, 0.85)",
    glow: "0 0 10px rgba(196, 30, 58, 0.6)",
    mutedTextColor: "#b68d93",
    spellLevels: {
      0: "#6b7280", // Заговоры
      1: "#bf0603", // 1 уровень
      2: "#d00000", // 2 уровень
      3: "#dc2f02", // 3 уровень
      4: "#e85d04", // 4 уровень
      5: "#f48c06", // 5 уровень
      6: "#faa307", // 6 уровень
      7: "#ffba08", // 7 уровень
      8: "#9d0208", // 8 уровень
      9: "#6a040f"  // 9 уровень
    }
  },
  forest: {
    name: "Forest",
    background: "#0a1a0c",
    foreground: "#0d230f",
    primary: "#007236",
    accent: "#00924a",
    textColor: "#d7f8db",
    cardBackground: "rgba(13, 35, 15, 0.85)",
    glow: "0 0 10px rgba(0, 146, 74, 0.6)",
    mutedTextColor: "#8db693",
    spellLevels: {
      0: "#606c38", // Заговоры
      1: "#283618", // 1 уровень
      2: "#3a5a40", // 2 уровень
      3: "#588157", // 3 уровень
      4: "#a3b18a", // 4 уровень
      5: "#344e41", // 5 уровень
      6: "#52796f", // 6 уровень
      7: "#84a98c", // 7 уровень
      8: "#2d6a4f", // 8 уровень
      9: "#1b4332"  // 9 уровень
    }
  },
  ocean: {
    name: "Ocean",
    background: "#0a101a",
    foreground: "#0d1423",
    primary: "#005b99",
    accent: "#0072c4",
    textColor: "#d7eaf8",
    cardBackground: "rgba(13, 20, 35, 0.85)",
    glow: "0 0 10px rgba(0, 114, 196, 0.6)",
    mutedTextColor: "#8d9db6",
    spellLevels: {
      0: "#023e8a", // Заговоры
      1: "#0077b6", // 1 уровень
      2: "#0096c7", // 2 уровень
      3: "#00b4d8", // 3 уровень
      4: "#48cae4", // 4 уровень
      5: "#90e0ef", // 5 уровень
      6: "#03045e", // 6 уровень
      7: "#0077b6", // 7 уровень
      8: "#0096c7", // 8 уровень
      9: "#023e8a"  // 9 уровень
    }
  },
  sunset: {
    name: "Sunset",
    background: "#1a0e0a",
    foreground: "#23120d",
    primary: "#cb6c34",
    accent: "#e67e22",
    textColor: "#f8e4d7",
    cardBackground: "rgba(35, 18, 13, 0.85)",
    glow: "0 0 10px rgba(230, 126, 34, 0.6)",
    mutedTextColor: "#b69a8d",
    spellLevels: {
      0: "#ffcdb2", // Заговоры
      1: "#ffb4a2", // 1 уровень
      2: "#e5989b", // 2 уровень
      3: "#b5838d", // 3 уровень
      4: "#6d6875", // 4 уровень
      5: "#cb997e", // 5 уровень
      6: "#ddbea9", // 6 уровень
      7: "#ffe8d6", // 7 уровень
      8: "#b08968", // 8 уровень
      9: "#7f5539"  // 9 уровень
    }
  },
  twilight: {
    name: "Twilight",
    background: "#0f0a1a",
    foreground: "#150d23",
    primary: "#4834cb",
    accent: "#5e3fd4",
    textColor: "#dcd7f8",
    cardBackground: "rgba(21, 13, 35, 0.85)",
    glow: "0 0 10px rgba(94, 63, 212, 0.6)",
    mutedTextColor: "#9a8db6",
    spellLevels: {
      0: "#7371fc", // Заговоры
      1: "#5e60ce", // 1 уровень
      2: "#4ea8de", // 2 уровень
      3: "#48bfe3", // 3 уровень
      4: "#56cfe1", // 4 уровень
      5: "#64dfdf", // 5 уровень
      6: "#72efdd", // 6 уровень
      7: "#80ffdb", // 7 уровень
      8: "#5390d9", // 8 уровень
      9: "#4361ee"  // 9 уровень
    }
  }
};
