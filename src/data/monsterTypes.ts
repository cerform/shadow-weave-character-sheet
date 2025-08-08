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
    modelPath: "/models/goblin.glb",
    scale: [0.3, 0.3, 0.3],
    color: "#4ade80",
    size: "small",
    hp: 7,
    ac: 15,
  },
  orc: {
    name: "Орк", 
    modelPath: "/models/orc.glb",
    scale: [0.4, 0.4, 0.4],
    color: "#22c55e",
    size: "medium",
    hp: 15,
    ac: 13,
  },
  dragon: {
    name: "Дракон",
    modelPath: "/models/dragon.glb", 
    scale: [1.5, 1.5, 1.5],
    color: "#dc2626",
    size: "huge",
    hp: 256,
    ac: 19,
  },
  skeleton: {
    name: "Скелет",
    modelPath: "/models/skeleton.glb",
    scale: [0.35, 0.35, 0.35], 
    color: "#e5e7eb",
    size: "medium",
    hp: 13,
    ac: 13,
  },
  wolf: {
    name: "Волк",
    modelPath: "/models/wolf.glb",
    scale: [0.4, 0.4, 0.4],
    color: "#6b7280",
    size: "medium", 
    hp: 11,
    ac: 13,
  },
  golem: {
    name: "Голем",
    modelPath: "/models/golem.glb",
    scale: [0.8, 0.8, 0.8],
    color: "#78716c",
    size: "large",
    hp: 178,
    ac: 17,
  },
};

export const getMonsterType = (type: string): MonsterType | null => {
  return monsterTypes[type] || null;
};

export const getAllMonsterTypes = (): string[] => {
  return Object.keys(monsterTypes);
};