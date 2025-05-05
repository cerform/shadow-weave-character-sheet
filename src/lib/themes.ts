
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
    buttonText: "#ffffff"
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
    buttonText: "#ffffff"
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
    mutedTextColor: "#b68d93"
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
    mutedTextColor: "#8db693"
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
    mutedTextColor: "#8d9db6"
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
    mutedTextColor: "#b69a8d"
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
    mutedTextColor: "#9a8db6"
  }
};
