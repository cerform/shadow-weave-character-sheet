
interface Theme {
  name: string;
  accent: string;
  primaryGradient: string;
  secondaryGradient: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  statBoxBackground: string;
  buttonBackground: string;
  buttonText: string;
  abilityScoreColor: string;
  glow: string;
}

export const themes: { [key: string]: Theme } = {
  default: {
    name: "Таверна",
    accent: "#8B5A2B",
    primaryGradient: "from-amber-900 to-stone-900",
    secondaryGradient: "from-amber-800/20 to-stone-900/20",
    cardBackground: "rgba(20, 15, 30, 0.85)",
    textColor: "#FFFFFF", // Обновлено до светлого цвета
    mutedTextColor: "#DDDDDD", // Обновлено до светлого цвета
    statBoxBackground: "rgba(0, 0, 0, 0.75)",
    buttonBackground: "rgba(139, 90, 43, 0.7)",
    buttonText: "#FFFFFF",
    abilityScoreColor: "#FFFFFF",
    glow: "0 0 15px rgba(139, 90, 43, 0.5)",
  },
  warlock: {
    name: "Колдун",
    accent: "#9061F9",
    primaryGradient: "from-purple-900 to-indigo-900",
    secondaryGradient: "from-purple-800/20 to-indigo-900/20",
    cardBackground: "rgba(15, 10, 25, 0.85)",
    textColor: "#FFFFFF", // Обновлено до светлого цвета
    mutedTextColor: "#DDDDDD", // Обновлено до светлого цвета
    statBoxBackground: "rgba(0, 0, 0, 0.75)",
    buttonBackground: "rgba(144, 97, 249, 0.7)",
    buttonText: "#FFFFFF",
    abilityScoreColor: "#D8BFD8",
    glow: "0 0 15px rgba(144, 97, 249, 0.5)",
  },
  wizard: {
    name: "Волшебник",
    accent: "#3B82F6",
    primaryGradient: "from-blue-900 to-indigo-900",
    secondaryGradient: "from-blue-800/20 to-indigo-900/20",
    cardBackground: "rgba(10, 15, 30, 0.85)",
    textColor: "#FFFFFF", // Обновлено до светлого цвета
    mutedTextColor: "#DDDDDD", // Обновлено до светлого цвета
    statBoxBackground: "rgba(0, 0, 0, 0.75)",
    buttonBackground: "rgba(59, 130, 246, 0.7)",
    buttonText: "#FFFFFF",
    abilityScoreColor: "#ADD8E6",
    glow: "0 0 15px rgba(59, 130, 246, 0.5)",
  },
  druid: {
    name: "Друид",
    accent: "#10B981",
    primaryGradient: "from-green-900 to-emerald-700",
    secondaryGradient: "from-green-800/20 to-emerald-700/20",
    cardBackground: "rgba(10, 30, 15, 0.85)",
    textColor: "#FFFFFF", // Обновлено до светлого цвета
    mutedTextColor: "#DDDDDD", // Обновлено до светлого цвета
    statBoxBackground: "rgba(0, 0, 0, 0.75)",
    buttonBackground: "rgba(16, 185, 129, 0.7)",
    buttonText: "#FFFFFF",
    abilityScoreColor: "#90EE90",
    glow: "0 0 15px rgba(16, 185, 129, 0.5)",
  },
  warrior: {
    name: "Воин",
    accent: "#F43F5E",
    primaryGradient: "from-red-900 to-rose-700",
    secondaryGradient: "from-red-800/20 to-rose-700/20",
    cardBackground: "rgba(30, 15, 10, 0.85)",
    textColor: "#FFFFFF", // Обновлено до светлого цвета
    mutedTextColor: "#DDDDDD", // Обновлено до светлого цвета
    statBoxBackground: "rgba(0, 0, 0, 0.75)",
    buttonBackground: "rgba(244, 63, 94, 0.7)",
    buttonText: "#FFFFFF",
    abilityScoreColor: "#FFA07A",
    glow: "0 0 15px rgba(244, 63, 94, 0.5)",
  },
  bard: {
    name: "Бард",
    accent: "#F59E0B",
    primaryGradient: "from-amber-700 to-yellow-600",
    secondaryGradient: "from-amber-600/20 to-yellow-500/20",
    cardBackground: "rgba(30, 25, 10, 0.85)",
    textColor: "#FFFFFF", // Обновлено до светлого цвета
    mutedTextColor: "#DDDDDD", // Обновлено до светлого цвета
    statBoxBackground: "rgba(0, 0, 0, 0.75)",
    buttonBackground: "rgba(245, 158, 11, 0.7)",
    buttonText: "#FFFFFF",
    abilityScoreColor: "#FFD700",
    glow: "0 0 15px rgba(245, 158, 11, 0.5)",
  },
};

export default themes;
