export interface MonsterType {
  name: string;
  modelPath: string;
  scale: [number, number, number];
  color: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  hp: number;
  ac: number;
}

export const monsterTypes: Record<string, MonsterType> = {
  goblin: {
    name: "Гоблин",
    modelPath: "/models/creature.glb", // Использует загруженную модель
    scale: [0.3, 0.3, 0.3],
    color: "#4ade80",
    size: "small",
    hp: 7,
    ac: 15,
  },
  orc: {
    name: "Орк", 
    modelPath: "/models/robot.glb", // Робот как временная замена орка
    scale: [0.4, 0.4, 0.4],
    color: "#22c55e",
    size: "medium",
    hp: 15,
    ac: 13,
  },
  dragon: {
    name: "Дракон",
    modelPath: "/models/duck.glb", // Утка как дракон (фантазийная интерпретация)
    scale: [2.0, 2.0, 2.0],
    color: "#dc2626",
    size: "huge",
    hp: 256,
    ac: 19,
  },
  skeleton: {
    name: "Скелет",
    modelPath: "/models/human-fighter.glb", // Человек как скелет
    scale: [0.35, 0.35, 0.35], 
    color: "#e5e7eb",
    size: "medium",
    hp: 13,
    ac: 13,
  },
  wolf: {
    name: "Волк",
    modelPath: "/models/duck.glb", // Используем утку с другим масштабом
    scale: [0.6, 0.6, 0.6],
    color: "#6b7280",
    size: "medium", 
    hp: 11,
    ac: 13,
  },
  golem: {
    name: "Голем",
    modelPath: "/models/robot.glb", // Робот отлично подходит для голема
    scale: [0.8, 0.8, 0.8],
    color: "#78716c",
    size: "large",
    hp: 178,
    ac: 17,
  },
  // Добавляем новый тип персонажа
  fighter: {
    name: "Воин",
    modelPath: "/models/human-fighter.glb",
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