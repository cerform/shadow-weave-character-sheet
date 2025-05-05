export interface Theme {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  textColor: string;
  cardBackground: string;
  glow?: string;
  buttonText?: string;     // Adding this missing property
  mutedTextColor?: string; // Adding this missing property
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
    background: "#F5F5F4",
    foreground: "#09090B",
    primary: "#7E22CE",
    accent: "#E2E8F0",
    textColor: "#475569",
    cardBackground: "#FFFFFF",
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#94a3b8", // Adding mutedTextColor property
    glow: '0 0 8px rgba(126, 34, 206, 0.5)',
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
    background: "#18181B",
    foreground: "#F8FAFC",
    primary: "#9333EA",
    accent: "#334155",
    textColor: "#CBD5E1",
    cardBackground: "#1E293B",
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#94a3b8", // Adding mutedTextColor property
    glow: '0 0 8px rgba(147, 51, 234, 0.5)',
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
    background: "#EADDCA",
    foreground: "#272343",
    primary: "#6246EA",
    accent: "#A3A380",
    textColor: "#5F6368",
    cardBackground: "#F0EAD6",
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#7f7f7f", // Adding mutedTextColor property
    glow: '0 0 8px rgba(98, 70, 234, 0.5)',
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
    background: "#1A1A1A",
    foreground: "#64FFDA",
    primary: "#BB86FC",
    accent: "#333333",
    textColor: "#B2B2B2",
    cardBackground: "#2B2B2B",
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#808080", // Adding mutedTextColor property
    glow: '0 0 8px rgba(187, 134, 252, 0.5)',
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
    background: "#E8F5E9",
    foreground: "#1B5E20",
    primary: "#388E3C",
    accent: "#A5D6A7",
    textColor: "#43A047",
    cardBackground: "#C8E6C9",
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#689F38", // Adding mutedTextColor property
    glow: '0 0 8px rgba(56, 142, 60, 0.5)',
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
    background: "#301934", // Deep Purple
    foreground: "#FF4081", // Hot Pink
    primary: "#D0B4DE", // Lavender
    accent: "#4A235A", // Dark Amethyst
    textColor: "#E1BEE7", // Light Lavender
    cardBackground: "#4E342E", // Dark Brown
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#BA68C8", // Adding mutedTextColor property
    glow: '0 0 8px rgba(208, 180, 222, 0.5)',
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
    background: "#0D47A1", // Dark Blue
    foreground: "#E3F2FD", // Light Blue
    primary: "#90CAF9", // Blue
    accent: "#1565C0", // Darker Blue
    textColor: "#BBDEFB", // Light Blue
    cardBackground: "#1A237E", // Dark Navy
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#64B5F6", // Adding mutedTextColor property
    glow: '0 0 8px rgba(144, 202, 249, 0.5)',
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
    background: "#43A047", // Dark Green
    foreground: "#A5D6A7", // Light Green
    primary: "#66BB6A", // Green
    accent: "#2E7D32", // Darker Green
    textColor: "#C8E6C9", // Light Green
    cardBackground: "#33691E", // Dark Olive
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#81C784", // Adding mutedTextColor property
    glow: '0 0 8px rgba(102, 187, 106, 0.5)',
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
    background: "#B71C1C", // Dark Red
    foreground: "#FFCDD2", // Light Red
    primary: "#E57373", // Red
    accent: "#880E4F", // Darker Red
    textColor: "#EF9A9A", // Light Red
    cardBackground: "#311B92", // Dark Purple
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#EF5350", // Adding mutedTextColor property
    glow: '0 0 8px rgba(229, 115, 115, 0.5)',
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
    background: "#9C27B0", // Purple
    foreground: "#E1BEE7", // Lavender
    primary: "#CE93D8", // Light Purple
    accent: "#7B1FA2", // Darker Purple
    textColor: "#D1C4E9", // Light Lavender
    cardBackground: "#4A148C", // Dark Violet
    buttonText: "#FFFFFF",    // Adding buttonText property
    mutedTextColor: "#BA68C8", // Adding mutedTextColor property
    glow: '0 0 8px rgba(206, 147, 216, 0.5)',
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
