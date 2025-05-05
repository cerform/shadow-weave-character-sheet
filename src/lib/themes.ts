export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground?: string;
  textColor: string;
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
  },
  dark: {
    primary: "#4f46e5",
    secondary: "#9ca3af",
    accent: "#c7d2fe",
    background: "#0f172a",
    cardBackground: "rgba(15, 23, 42, 0.85)",
    textColor: "#cbd5e1",
    buttonText: "#cbd5e1",
  },
  light: {
    primary: "#2563eb",
    secondary: "#4b5563",
    accent: "#bfdbfe",
    background: "#f1f5f9",
    cardBackground: "rgba(241, 245, 249, 0.85)",
    textColor: "#0f172a",
    buttonText: "#0f172a",
  },
  cyberpunk: {
    primary: "#ff4081",
    secondary: "#00bcd4",
    accent: "#ffff00",
    background: "#212121",
    cardBackground: "rgba(33, 33, 33, 0.85)",
    textColor: "#ffffff",
    buttonText: "#ffffff",
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
  },
  nature: {
    primary: "#4caf50",
    secondary: "#8d6e63",
    accent: "#a5d6a7",
    background: "#e8f5e9",
    cardBackground: "rgba(232, 245, 233, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
  },
  ocean: {
    primary: "#29b6f6",
    secondary: "#26a69a",
    accent: "#4dd0e1",
    background: "#e0f7fa",
    cardBackground: "rgba(224, 247, 250, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
  },
  sunset: {
    primary: "#ff7043",
    secondary: "#795548",
    accent: "#ffab91",
    background: "#fbe9e7",
    cardBackground: "rgba(251, 233, 231, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
  },
  pastel: {
    primary: "#90caf9",
    secondary: "#bcaaa4",
    accent: "#bbdefb",
    background: "#f0f4c3",
    cardBackground: "rgba(240, 244, 195, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
  },
  mint: {
    primary: "#a7ffeb",
    secondary: "#80cbc4",
    accent: "#b2fab4",
    background: "#e8f5e9",
    cardBackground: "rgba(232, 245, 233, 0.85)",
    textColor: "#212121",
    buttonText: "#212121",
  },
};
