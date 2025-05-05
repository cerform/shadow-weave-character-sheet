
export interface Theme {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  textColor: string;
  cardBackground: string;
  cardForeground?: string;
  glow?: string;
  buttonText?: string;     
  mutedTextColor?: string; 
  // Новые свойства для усовершенствованного визуального стиля
  backgroundGradient?: string;
  backgroundBrightness?: number;
  decorativeCorners?: boolean;
  spellLevels?: {
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
    background: "#1E1E2E",
    foreground: "#E4E6EA",
    primary: "#7E22CE",
    accent: "#9D5CFF",
    textColor: "#E4E6EA",
    cardBackground: "rgba(30, 30, 46, 0.75)",
    cardForeground: "#E4E6EA",
    buttonText: "#FFFFFF",
    mutedTextColor: "#94a3b8",
    glow: '0 0 8px rgba(157, 92, 255, 0.5)',
    backgroundBrightness: 0.7,
    backgroundGradient: "linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6))",
    decorativeCorners: true,
    spellLevels: {
      0: '#4ade80',  // Green
      1: '#38bdf8',  // Blue
      2: '#f472b6',  // Pink
      3: '#facc15',  // Yellow
      4: '#a78bfa',  // Purple
      5: '#ef4444',  // Red
      6: '#64ffda',  // Teal
      7: '#e040fb',  // Violet
      8: '#ffab40',  // Orange
      9: '#4fc3f7'   // Light Blue
    }
  },
  
  // Обновляем существующие темы с новыми свойствами
  dark: {
    name: "dark",
    background: "#0f0f17",
    foreground: "#F8FAFC",
    primary: "#9333EA",
    accent: "#9D5CFF",
    textColor: "#CBD5E1",
    cardBackground: "rgba(26, 27, 38, 0.85)",
    cardForeground: "#CBD5E1",
    buttonText: "#FFFFFF",
    mutedTextColor: "#94a3b8",
    glow: '0 0 8px rgba(157, 92, 255, 0.5)',
    backgroundBrightness: 0.6,
    backgroundGradient: "linear-gradient(to bottom, rgba(15, 15, 23, 0.8), rgba(15, 15, 23, 0.7))",
    decorativeCorners: true,
    spellLevels: {
      0: '#4ade80',
      1: '#38bdf8',
      2: '#f472b6',
      3: '#facc15',
      4: '#a78bfa',
      5: '#ef4444',
      6: '#64ffda',
      7: '#e040fb',
      8: '#ffab40',
      9: '#4fc3f7'
    }
  },
  
  warlock: {
    name: "warlock",
    background: "#1E1A29",
    foreground: "#F5E1FF",
    primary: "#D0B4DE",
    accent: "#9061F9",
    textColor: "#F5E1FF",
    cardBackground: "rgba(45, 35, 60, 0.85)",
    cardForeground: "#F5E1FF",
    buttonText: "#FFFFFF",
    mutedTextColor: "#D8BFE5",
    glow: '0 0 10px rgba(144, 97, 249, 0.5)',
    backgroundBrightness: 0.5,
    backgroundGradient: "linear-gradient(135deg, rgba(30, 26, 41, 0.8), rgba(45, 35, 60, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#BE9CFF',  // Light Purple
      1: '#E91E63',  // Rose
      2: '#9C27B0',  // Purple
      3: '#673AB7',  // Deep Purple
      4: '#3F51B5',  // Indigo
      5: '#2196F3',  // Blue
      6: '#03A9F4',  // Light Blue
      7: '#00BCD4',  // Cyan
      8: '#009688',  // Teal
      9: '#4CAF50'   // Green
    }
  },
  
  wizard: {
    name: "wizard",
    background: "#0A1A40",
    foreground: "#E3F2FD",
    primary: "#90CAF9",
    accent: "#3B82F6",
    textColor: "#E3F2FD",
    cardBackground: "rgba(13, 31, 68, 0.85)",
    cardForeground: "#E3F2FD",
    buttonText: "#FFFFFF",
    mutedTextColor: "#BBDEFB",
    glow: '0 0 10px rgba(59, 130, 246, 0.5)',
    backgroundBrightness: 0.5,
    backgroundGradient: "linear-gradient(135deg, rgba(10, 26, 64, 0.8), rgba(13, 31, 68, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#81D4FA',  // Sky Blue
      1: '#4FC3F7',  // Light Blue
      2: '#29B6F6',  // Cyan
      3: '#03A9F4',  // Light Cyan
      4: '#039BE5',  // Deep Sky Blue
      5: '#0288D1',  // Blue
      6: '#01579B',  // Dark Blue
      7: '#1A237E',  // Navy Blue
      8: '#303F9F',  // Indigo
      9: '#3949AB'   // Dark Indigo
    }
  },
  
  druid: {
    name: "druid",
    background: "#1A3522",
    foreground: "#C8E6C9",
    primary: "#66BB6A",
    accent: "#10B981",
    textColor: "#C8E6C9",
    cardBackground: "rgba(30, 60, 40, 0.85)",
    cardForeground: "#C8E6C9",
    buttonText: "#FFFFFF",
    mutedTextColor: "#A5D6A7",
    glow: '0 0 10px rgba(16, 185, 129, 0.5)',
    backgroundBrightness: 0.6,
    backgroundGradient: "linear-gradient(135deg, rgba(26, 53, 34, 0.8), rgba(30, 60, 40, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#81C784',  // Light Green
      1: '#66BB6A',  // Green
      2: '#4CAF50',  // Forest Green
      3: '#43A047',  // Dark Green
      4: '#388E3C',  // Olive Green
      5: '#2E7D32',  // Dark Olive Green
      6: '#1B5E20',  // Deep Green
      7: '#33691E',  // Dark Olive
      8: '#558B2F',  // Light Olive
      9: '#827717'   // Olive
    }
  },
  
  warrior: {
    name: "warrior",
    background: "#2D1A1A",
    foreground: "#FFE5E5",
    primary: "#E57373",
    accent: "#F43F5E",
    textColor: "#FFE5E5",
    cardBackground: "rgba(54, 30, 30, 0.85)",
    cardForeground: "#FFE5E5",
    buttonText: "#FFFFFF",
    mutedTextColor: "#FFBDBD",
    glow: '0 0 10px rgba(244, 63, 94, 0.5)',
    backgroundBrightness: 0.55,
    backgroundGradient: "linear-gradient(135deg, rgba(45, 26, 26, 0.8), rgba(54, 30, 30, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#EF5350',  // Red
      1: '#E53935',  // Dark Red
      2: '#D32F2F',  // Even Darker Red
      3: '#C62828',  // Deep Red
      4: '#B71C1C',  // Darkest Red
      5: '#F44336',  // Light Red
      6: '#E57373',  // Lighter Red
      7: '#EF9A9A',  // Lightest Red
      8: '#FFCDD2',  // Pale Red
      9: '#FFEBEE'   // Very Pale Red
    }
  },
  
  bard: {
    name: "bard",
    background: "#2D1A2D",
    foreground: "#F3E5F5",
    primary: "#CE93D8",
    accent: "#F59E0B",
    textColor: "#F3E5F5",
    cardBackground: "rgba(54, 30, 54, 0.85)",
    cardForeground: "#F3E5F5",
    buttonText: "#FFFFFF",
    mutedTextColor: "#E1BEE7",
    glow: '0 0 10px rgba(245, 158, 11, 0.5)',
    backgroundBrightness: 0.5,
    backgroundGradient: "linear-gradient(135deg, rgba(45, 26, 45, 0.8), rgba(54, 30, 54, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#E040FB',  // Purple
      1: '#D500F9',  // Dark Purple
      2: '#AA00FF',  // Even Darker Purple
      3: '#6200EA',  // Deep Purple
      4: '#4A148C',  // Darkest Purple
      5: '#BA68C8',  // Light Purple
      6: '#CE93D8',  // Lighter Purple
      7: '#E1BEE7',  // Lightest Purple
      8: '#F3E5F5',  // Pale Purple
      9: '#F5F5F5'   // Very Pale Purple
    }
  },
  
  // Добавляем новые темы
  parchment: {
    name: "parchment",
    background: "#F7F1DC",
    foreground: "#3B3B3B",
    primary: "#8B5A2B",
    accent: "#BFA76F",
    textColor: "#3B3B3B",
    cardBackground: "rgba(247, 241, 220, 0.85)",
    cardForeground: "#3B3B3B",
    buttonText: "#F7F1DC",
    mutedTextColor: "#6E5C3B",
    glow: '0 0 10px rgba(191, 167, 111, 0.5)',
    backgroundBrightness: 0.9,
    backgroundGradient: "linear-gradient(135deg, rgba(247, 241, 220, 0.7), rgba(235, 225, 195, 0.7))",
    decorativeCorners: true,
    spellLevels: {
      0: '#8B5A2B',  // Brown
      1: '#6E1E1E',  // Dark Red
      2: '#8B5A2B',  // Brown
      3: '#6E1E1E',  // Dark Red
      4: '#8B5A2B',  // Brown
      5: '#6E1E1E',  // Dark Red
      6: '#8B5A2B',  // Brown
      7: '#6E1E1E',  // Dark Red
      8: '#8B5A2B',  // Brown
      9: '#6E1E1E'   // Dark Red
    }
  },
  
  dungeon: {
    name: "dungeon",
    background: "#221F26",
    foreground: "#E6D8B5",
    primary: "#6246EA",
    accent: "#CF5C36",
    textColor: "#E6D8B5",
    cardBackground: "rgba(34, 31, 38, 0.85)",
    cardForeground: "#E6D8B5",
    buttonText: "#FFFFFF",
    mutedTextColor: "#BFB393",
    glow: '0 0 10px rgba(207, 92, 54, 0.5)',
    backgroundBrightness: 0.4,
    backgroundGradient: "linear-gradient(135deg, rgba(34, 31, 38, 0.8), rgba(25, 22, 29, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#CF5C36',  // Rust
      1: '#EFC88B',  // Sand
      2: '#CF5C36',  // Rust
      3: '#EFC88B',  // Sand
      4: '#CF5C36',  // Rust
      5: '#EFC88B',  // Sand
      6: '#CF5C36',  // Rust
      7: '#EFC88B',  // Sand
      8: '#CF5C36',  // Rust
      9: '#EFC88B'   // Sand
    }
  },
  
  infernal: {
    name: "infernal",
    background: "#2C0B0E",
    foreground: "#FFEBEE",
    primary: "#EF233C",
    accent: "#D90429",
    textColor: "#FFEBEE",
    cardBackground: "rgba(44, 11, 14, 0.85)", 
    cardForeground: "#FFEBEE",
    buttonText: "#FFFFFF",
    mutedTextColor: "#FFCDD2",
    glow: '0 0 10px rgba(217, 4, 41, 0.5)',
    backgroundBrightness: 0.45,
    backgroundGradient: "linear-gradient(135deg, rgba(44, 11, 14, 0.8), rgba(65, 16, 21, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#FFCDD2',  // Light Red
      1: '#EF9A9A',  // Light Salmon
      2: '#E57373',  // Salmon
      3: '#EF5350',  // Red
      4: '#F44336',  // Red
      5: '#E53935',  // Dark Red
      6: '#D32F2F',  // Darker Red
      7: '#C62828',  // Deep Red
      8: '#B71C1C',  // Very Deep Red
      9: '#8B0000'   // Dark Red
    }
  },
  
  celestial: {
    name: "celestial",
    background: "#2A4B7C",
    foreground: "#F8F9FA",
    primary: "#4B9CD3",
    accent: "#F1C40F",
    textColor: "#F8F9FA",
    cardBackground: "rgba(42, 75, 124, 0.85)",
    cardForeground: "#F8F9FA",
    buttonText: "#2A4B7C",
    mutedTextColor: "#D6EAF8",
    glow: '0 0 10px rgba(241, 196, 15, 0.5)',
    backgroundBrightness: 0.6,
    backgroundGradient: "linear-gradient(135deg, rgba(42, 75, 124, 0.8), rgba(30, 55, 93, 0.8))",
    decorativeCorners: true,
    spellLevels: {
      0: '#F1C40F',  // Gold
      1: '#F39C12',  // Orange
      2: '#E67E22',  // Dark Orange
      3: '#D35400',  // Red-Orange
      4: '#E74C3C',  // Red
      5: '#C0392B',  // Dark Red
      6: '#9B59B6',  // Purple
      7: '#8E44AD',  // Dark Purple
      8: '#2980B9',  // Blue
      9: '#3498DB'   // Light Blue
    }
  }
};

// Экспортируем также типы тем для использования в TypeScript
export type ThemeName = keyof typeof themes;
