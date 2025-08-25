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
    modelPath: "storage:monsters/goblin/low/model.glb",
    scale: [0.3, 0.3, 0.3],
    color: "#4ade80",
    size: "small",
    hp: 7,
    ac: 15,
  },
  orc: {
    name: "Орк",
    modelPath: "storage:monsters/orc/low/model.glb",
    scale: [0.45, 0.45, 0.45],
    color: "#22c55e",
    size: "medium",
    hp: 15,
    ac: 13,
  },
  dragon: {
    name: "Дракон",
    modelPath: "storage:monsters/dragon/low/model.glb",
    scale: [1.2, 1.2, 1.2],
    color: "#dc2626",
    size: "huge",
    hp: 256,
    ac: 19,
  },
  skeleton: {
    name: "Скелет",
    modelPath: "storage:monsters/skeleton/low/model.glb",
    scale: [0.35, 0.35, 0.35],
    color: "#e5e7eb",
    size: "medium",
    hp: 13,
    ac: 13,
  },
  wolf: {
    name: "Волк",
    modelPath: "storage:monsters/wolf/low/model.glb",
    scale: [0.6, 0.6, 0.6],
    color: "#6b7280",
    size: "medium",
    hp: 11,
    ac: 13,
  },
  golem: {
    name: "Голем",
    modelPath: "storage:monsters/golem/low/model.glb",
    scale: [0.8, 0.8, 0.8],
    color: "#78716c",
    size: "large",
    hp: 178,
    ac: 17,
  },
  fighter: {
    name: "Воин",
    modelPath: "storage:monsters/fighter/low/model.glb",
    scale: [0.5, 0.5, 0.5],
    color: "#3b82f6",
    size: "medium",
    hp: 45,
    ac: 18,
  },
  troll: {
    name: "Тролль",
    modelPath: "storage:monsters/troll/low/model.glb",
    scale: [0.7, 0.7, 0.7],
    color: "#059669",
    size: "large",
    hp: 84,
    ac: 15,
  },
  zombie: {
    name: "Зомби",
    modelPath: "storage:monsters/zombie/low/model.glb",
    scale: [0.4, 0.4, 0.4],
    color: "#6b7280",
    size: "medium",
    hp: 22,
    ac: 8,
  },
  lich: {
    name: "Лич",
    modelPath: "storage:monsters/lich/low/model.glb",
    scale: [0.5, 0.5, 0.5],
    color: "#7c3aed",
    size: "medium",
    hp: 135,
    ac: 17,
  },
  bear: {
    name: "Медведь",
    modelPath: "storage:monsters/bear/low/model.glb",
    scale: [0.6, 0.6, 0.6],
    color: "#92400e",
    size: "large",
    hp: 34,
    ac: 11,
  },
  spider: {
    name: "Паук",
    modelPath: "storage:monsters/spider/low/model.glb",
    scale: [0.4, 0.4, 0.4],
    color: "#1f2937",
    size: "medium",
    hp: 26,
    ac: 14,
  },
  elemental: {
    name: "Элементаль",
    modelPath: "storage:monsters/elemental/low/model.glb",
    scale: [0.6, 0.6, 0.6],
    color: "#ef4444",
    size: "large",
    hp: 102,
    ac: 15,
  },
  wizard: {
    name: "Волшебник",
    modelPath: "storage:monsters/wizard/low/model.glb",
    scale: [0.45, 0.45, 0.45],
    color: "#3b82f6",
    size: "medium",
    hp: 40,
    ac: 12,
  },
  rogue: {
    name: "Разбойник",
    modelPath: "storage:monsters/rogue/low/model.glb",
    scale: [0.45, 0.45, 0.45],
    color: "#6b7280",
    size: "medium",
    hp: 35,
    ac: 15,
  },
};

export const getMonsterType = (type: string): MonsterType | null => {
  return monsterTypes[type] || null;
};

export const getAllMonsterTypes = (): string[] => {
  return Object.keys(monsterTypes);
};