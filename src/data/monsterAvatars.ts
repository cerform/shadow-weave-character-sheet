// 2D Аватары для монстров - простые цветные иконки
export interface MonsterAvatar {
  name: string;
  emoji: string;
  color: string;
  backgroundColor: string;
  size: 'small' | 'medium' | 'large' | 'huge';
}

export const monsterAvatars: Record<string, MonsterAvatar> = {
  goblin: {
    name: "Гоблин",
    emoji: "👹",
    color: "#ffffff",
    backgroundColor: "#4ade80",
    size: "small"
  },
  orc: {
    name: "Орк",
    emoji: "👺",
    color: "#ffffff", 
    backgroundColor: "#22c55e",
    size: "medium"
  },
  dragon: {
    name: "Дракон",
    emoji: "🐲",
    color: "#ffffff",
    backgroundColor: "#dc2626", 
    size: "huge"
  },
  skeleton: {
    name: "Скелет",
    emoji: "💀",
    color: "#000000",
    backgroundColor: "#e5e7eb",
    size: "medium"
  },
  wolf: {
    name: "Волк", 
    emoji: "🐺",
    color: "#ffffff",
    backgroundColor: "#6b7280",
    size: "medium"
  },
  golem: {
    name: "Голем",
    emoji: "🗿",
    color: "#ffffff",
    backgroundColor: "#78716c",
    size: "large"
  },
  fighter: {
    name: "Воин",
    emoji: "⚔️",
    color: "#ffffff",
    backgroundColor: "#3b82f6",
    size: "medium"
  },
};

export const getMonsterAvatar = (type: string): MonsterAvatar | null => {
  return monsterAvatars[type] || null;
};

export const getAllMonsterAvatars = (): string[] => {
  return Object.keys(monsterAvatars);
};