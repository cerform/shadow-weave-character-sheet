
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground?: string;
  textColor: string;
  buttonText?: string;
  buttonBackground?: string;
  glow?: string;
  mutedTextColor?: string;
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
  };
}

export const themes: { [key: string]: Theme } = {
  default: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#7dd3fc",
    background: "#1e293b",
    cardBackground: "rgba(30, 41, 59, 0.85)",
    textColor: "#f8fafc",
    buttonText: "#f8fafc",
    buttonBackground: "#3b82f6",
    glow: "0 0 10px rgba(125, 211, 252, 0.5)",
    mutedTextColor: "#94a3b8",
  },
  dark: {
    primary: "#4f46e5",
    secondary: "#9ca3af",
    accent: "#c7d2fe",
    background: "#0f172a",
    cardBackground: "rgba(15, 23, 42, 0.85)",
    textColor: "#cbd5e1",
    buttonText: "#cbd5e1",
    buttonBackground: "#4f46e5",
    glow: "0 0 10px rgba(199, 210, 254, 0.5)",
    mutedTextColor: "#94a3b8",
  },
  light: {
    primary: "#2563eb",
    secondary: "#4b5563",
    accent: "#bfdbfe",
    background: "#f1f5f9",
    cardBackground: "rgba(241, 245, 249, 0.85)",
    textColor: "#0f172a",
    buttonText: "#0f172a",
    buttonBackground: "#2563eb",
    glow: "0 0 10px rgba(191, 219, 254, 0.5)",
    mutedTextColor: "#64748b",
  },
  cyberpunk: {
    primary: "#ff4081",
    secondary: "#00bcd4",
    accent: "#ffff00",
    background: "#212121",
    cardBackground: "rgba(33, 33, 33, 0.85)",
    textColor: "#ffffff",
    buttonText: "#ffffff",
    buttonBackground: "#ff4081",
    glow: "0 0 15px rgba(255, 64, 129, 0.7)",
    mutedTextColor: "#b0bec5",
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
      level9: "#7c3aed",
    },
  },
  gothic: {
    primary: "#6e0505",
    secondary: "#4a4a4a",
    accent: "#b8b8b8",
    background: "#000000",
    cardBackground: "rgba(0, 0, 0, 0.85)",
    textColor: "#ffffff",
    buttonText: "#ffffff",
    buttonBackground: "#6e0505",
    glow: "0 0 10px rgba(110, 5, 5, 0.7)",
    mutedTextColor: "#a0a0a0",
  },
  nature: {
    primary: "#4caf50",
    secondary: "#8d6e63",
    accent: "#a5d6a7",
    background: "#e8f5e9",
    cardBackground: "rgba(232, 245, 233, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
    buttonBackground: "#4caf50",
    glow: "0 0 10px rgba(165, 214, 167, 0.7)",
    mutedTextColor: "#78909c",
  },
  ocean: {
    primary: "#29b6f6",
    secondary: "#26a69a",
    accent: "#4dd0e1",
    background: "#e0f7fa",
    cardBackground: "rgba(224, 247, 250, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
    buttonBackground: "#29b6f6",
    glow: "0 0 10px rgba(77, 208, 225, 0.7)",
    mutedTextColor: "#78909c",
  },
  sunset: {
    primary: "#ff7043",
    secondary: "#795548",
    accent: "#ffab91",
    background: "#fbe9e7",
    cardBackground: "rgba(251, 233, 231, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
    buttonBackground: "#ff7043",
    glow: "0 0 10px rgba(255, 171, 145, 0.7)",
    mutedTextColor: "#78909c",
  },
  pastel: {
    primary: "#90caf9",
    secondary: "#bcaaa4",
    accent: "#bbdefb",
    background: "#f0f4c3",
    cardBackground: "rgba(240, 244, 195, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
    buttonBackground: "#90caf9",
    glow: "0 0 10px rgba(187, 222, 251, 0.7)",
    mutedTextColor: "#78909c",
  },
  mint: {
    primary: "#a7ffeb",
    secondary: "#80cbc4",
    accent: "#b2fab4",
    background: "#e8f5e9",
    cardBackground: "rgba(232, 245, 233, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
    buttonBackground: "#a7ffeb",
    glow: "0 0 10px rgba(178, 250, 180, 0.7)",
    mutedTextColor: "#78909c",
  },
  warlock: {
    primary: "#9b30ff",
    secondary: "#4a4a4a",
    accent: "#d580ff",
    background: "#1a1a2e",
    cardBackground: "rgba(26, 26, 46, 0.85)",
    textColor: "#ffffff",
    buttonText: "#ffffff",
    buttonBackground: "#9b30ff",
    glow: "0 0 15px rgba(155, 48, 255, 0.7)",
    mutedTextColor: "#a0a0a0",
  },
  wizard: {
    primary: "#3b82f6",
    secondary: "#4a5568",
    accent: "#93c5fd",
    background: "#0f172a",
    cardBackground: "rgba(15, 23, 42, 0.85)",
    textColor: "#f8fafc",
    buttonText: "#f8fafc",
    buttonBackground: "#3b82f6",
    glow: "0 0 15px rgba(59, 130, 246, 0.7)",
    mutedTextColor: "#94a3b8",
  },
  druid: {
    primary: "#10b981",
    secondary: "#65a30d",
    accent: "#6ee7b7",
    background: "#064e3b",
    cardBackground: "rgba(6, 78, 59, 0.85)",
    textColor: "#ecfdf5",
    buttonText: "#064e3b",
    buttonBackground: "#10b981",
    glow: "0 0 15px rgba(16, 185, 129, 0.7)",
    mutedTextColor: "#d1fae5",
  },
  warrior: {
    primary: "#ef4444",
    secondary: "#b91c1c",
    accent: "#fca5a5",
    background: "#7f1d1d",
    cardBackground: "rgba(127, 29, 29, 0.85)",
    textColor: "#fef2f2",
    buttonText: "#ffffff",
    buttonBackground: "#ef4444",
    glow: "0 0 15px rgba(239, 68, 68, 0.7)",
    mutedTextColor: "#fee2e2",
  },
  bard: {
    primary: "#f59e0b",
    secondary: "#92400e",
    accent: "#fcd34d",
    background: "#451a03",
    cardBackground: "rgba(69, 26, 3, 0.85)",
    textColor: "#fffbeb",
    buttonText: "#451a03",
    buttonBackground: "#f59e0b",
    glow: "0 0 15px rgba(245, 158, 11, 0.7)",
    mutedTextColor: "#fef3c7",
  },
};
