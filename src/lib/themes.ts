
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
    background: "#1E1E2E", // Более темный фон для основного режима
    foreground: "#E4E6EA",
    primary: "#7E22CE",
    accent: "#9D5CFF", // Более яркий акцентный цвет
    textColor: "#E4E6EA", // Светлый текст для контраста
    cardBackground: "rgba(30, 30, 46, 0.75)", // Полупрозрачный фон карточек
    cardForeground: "#E4E6EA",
    buttonText: "#FFFFFF",
    mutedTextColor: "#94a3b8",
    glow: '0 0 8px rgba(157, 92, 255, 0.5)',
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
  fantasy: {
    name: "fantasy",
    background: "#2C2A35",
    foreground: "#E6D8B5",
    primary: "#6246EA",
    accent: "#A68A5B",
    textColor: "#E6D8B5",
    cardBackground: "rgba(48, 46, 64, 0.85)",
    cardForeground: "#E6D8B5",
    buttonText: "#FFFFFF",
    mutedTextColor: "#BFB393",
    glow: '0 0 8px rgba(166, 138, 91, 0.5)',
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
  cyber: {
    name: "cyber",
    background: "#1A1A2E",
    foreground: "#64FFDA",
    primary: "#BB86FC",
    accent: "#00FFAA",
    textColor: "#E2E2E2",
    cardBackground: "rgba(26, 26, 46, 0.85)",
    cardForeground: "#E2E2E2",
    buttonText: "#FFFFFF",
    mutedTextColor: "#B2B2B2",
    glow: '0 0 12px rgba(0, 255, 170, 0.5)',
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
  nature: {
    name: "nature",
    background: "#1A2F23",
    foreground: "#E5F5EB",
    primary: "#388E3C",
    accent: "#66BB6A",
    textColor: "#E5F5EB",
    cardBackground: "rgba(30, 55, 43, 0.85)",
    cardForeground: "#E5F5EB",
    buttonText: "#FFFFFF",
    mutedTextColor: "#B7E5C3",
    glow: '0 0 8px rgba(102, 187, 106, 0.5)',
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
  warlock: {
    name: "warlock",
    background: "#1E1A29", // Темный фиолетовый оттенок
    foreground: "#F5E1FF", // Светлый лавандовый для текста
    primary: "#D0B4DE", // Лавандовый для основных элементов
    accent: "#9061F9", // Яркий фиолетовый для акцентов
    textColor: "#F5E1FF", // Светлый лавандовый
    cardBackground: "rgba(45, 35, 60, 0.85)", // Полупрозрачный темно-фиолетовый
    cardForeground: "#F5E1FF",
    buttonText: "#FFFFFF",
    mutedTextColor: "#D8BFE5",
    glow: '0 0 10px rgba(144, 97, 249, 0.5)',
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
    background: "#0A1A40", // Темный синий
    foreground: "#E3F2FD", // Светлый синий
    primary: "#90CAF9", // Голубой
    accent: "#3B82F6", // Яркий синий
    textColor: "#E3F2FD", // Светло-голубой
    cardBackground: "rgba(13, 31, 68, 0.85)", // Полупрозрачный темно-синий
    cardForeground: "#E3F2FD",
    buttonText: "#FFFFFF",
    mutedTextColor: "#BBDEFB",
    glow: '0 0 10px rgba(59, 130, 246, 0.5)',
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
    background: "#1A3522", // Темно-зеленый
    foreground: "#C8E6C9", // Светло-зеленый
    primary: "#66BB6A", // Зеленый
    accent: "#10B981", // Яркий зеленый
    textColor: "#C8E6C9", // Светло-зеленый
    cardBackground: "rgba(30, 60, 40, 0.85)", // Полупрозрачный темно-зеленый
    cardForeground: "#C8E6C9",
    buttonText: "#FFFFFF",
    mutedTextColor: "#A5D6A7",
    glow: '0 0 10px rgba(16, 185, 129, 0.5)',
    spellLevels: {
      0: '#81C784',  // Light Green
      1: '#66BB6A',  // Green
      2: '#4CAF50',  // Forest Green
      3: '#43A047',  // Dark Green
      4: '#388E3C',  // Olive Green
      5: '#2E7D32',  // Dark Olive Green
      6: '#1B5E20',  // Deep Green
      7: '#33691E',  // Dark Olive
      8: '#212121',  // Black
      9: '#424242'   // Gray
    }
  },
  warrior: {
    name: "warrior",
    background: "#2D1A1A", // Темно-красный
    foreground: "#FFE5E5", // Светло-красный
    primary: "#E57373", // Красный
    accent: "#F43F5E", // Яркий красный
    textColor: "#FFE5E5", // Светло-красный
    cardBackground: "rgba(54, 30, 30, 0.85)", // Полупрозрачный темно-красный
    cardForeground: "#FFE5E5",
    buttonText: "#FFFFFF",
    mutedTextColor: "#FFBDBD",
    glow: '0 0 10px rgba(244, 63, 94, 0.5)',
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
    background: "#2D1A2D", // Темно-пурпурный
    foreground: "#F3E5F5", // Светло-пурпурный
    primary: "#CE93D8", // Пурпурный
    accent: "#F59E0B", // Яркий янтарный
    textColor: "#F3E5F5", // Светло-пурпурный
    cardBackground: "rgba(54, 30, 54, 0.85)", // Полупрозрачный темно-пурпурный
    cardForeground: "#F3E5F5",
    buttonText: "#FFFFFF",
    mutedTextColor: "#E1BEE7",
    glow: '0 0 10px rgba(245, 158, 11, 0.5)',
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
};
