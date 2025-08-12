export interface MonsterType {
  name: string;
  modelPath: string; // 'fallback' | 'storage:<path inside models>' | absolute URL
  scale: [number, number, number];
  color: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  hp: number;
  ac: number;
}

export const monsterTypes: Record<string, MonsterType> = {
  goblin: {
    name: "Гоблин",
    modelPath: "fallback",
    scale: [0.3, 0.3, 0.3],
    color: "#4ade80",
    size: "small",
    hp: 7,
    ac: 15,
  },
  orc: {
    name: "Орк",
    modelPath: "fallback",
    scale: [0.45, 0.45, 0.45],
    color: "#22c55e",
    size: "medium",
    hp: 15,
    ac: 13,
  },
  dragon: {
    name: "Дракон",
    modelPath: "fallback",
    scale: [1.2, 1.2, 1.2],
    color: "#dc2626",
    size: "huge",
    hp: 256,
    ac: 19,
  },
  skeleton: {
    name: "Скелет",
    modelPath: "fallback",
    scale: [0.35, 0.35, 0.35],
    color: "#e5e7eb",
    size: "medium",
    hp: 13,
    ac: 13,
  },
  wolf: {
    name: "Волк",
    modelPath: "fallback",
    scale: [0.6, 0.6, 0.6],
    color: "#6b7280",
    size: "medium",
    hp: 11,
    ac: 13,
  },
  golem: {
    name: "Голем",
    modelPath: "fallback",
    scale: [0.8, 0.8, 0.8],
    color: "#78716c",
    size: "large",
    hp: 178,
    ac: 17,
  },
  fighter: {
    name: "Воин",
    modelPath: "fallback",
    scale: [0.5, 0.5, 0.5],
    color: "#3b82f6",
    size: "medium",
    hp: 45,
    ac: 18,
  },
};

export const getMonsterType = (type: string): MonsterType | null => {
  return monsterTypes[type] || null;
};

export const getAllMonsterTypes = (): string[] => {
  return Object.keys(monsterTypes);
};