// Аватары для 3D ассетов - на основе storage_path
export interface Asset3DAvatar {
  name: string;
  emoji: string;
  color: string;
  backgroundColor: string;
  category: 'monster' | 'character' | 'structure' | 'item';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
}

// Соответствие путей storage_path к аватарам
export const asset3DAvatars: Record<string, Asset3DAvatar> = {
  // Монстры
  'monsters/goblin/low/model.glb': {
    name: "Гоблин",
    emoji: "👹",
    color: "#ffffff",
    backgroundColor: "#4ade80",
    category: "monster",
    size: "small"
  },
  'monsters/orc/low/model.glb': {
    name: "Орк",
    emoji: "👺",
    color: "#ffffff", 
    backgroundColor: "#22c55e",
    category: "monster",
    size: "medium"
  },
  'monsters/dragon/low/model.glb': {
    name: "Дракон",
    emoji: "🐲",
    color: "#ffffff",
    backgroundColor: "#dc2626", 
    category: "monster",
    size: "huge"
  },
  'monsters/skeleton/low/model.glb': {
    name: "Скелет",
    emoji: "💀",
    color: "#000000",
    backgroundColor: "#e5e7eb",
    category: "monster",
    size: "medium"
  },
  'monsters/wolf/low/model.glb': {
    name: "Волк", 
    emoji: "🐺",
    color: "#ffffff",
    backgroundColor: "#6b7280",
    category: "monster",
    size: "medium"
  },
  'monsters/golem/low/model.glb': {
    name: "Голем",
    emoji: "🗿",
    color: "#ffffff",
    backgroundColor: "#78716c",
    category: "monster",
    size: "large"
  },
  'monsters/fighter/low/model.glb': {
    name: "Воин-монстр",
    emoji: "⚔️",
    color: "#ffffff",
    backgroundColor: "#ef4444",
    category: "monster",
    size: "medium"
  },

  // Персонажи и герои
  'characters/fighter/low/model.glb': {
    name: "Воин",
    emoji: "🛡️",
    color: "#ffffff",
    backgroundColor: "#3b82f6",
    category: "character",
    size: "medium"
  },
  'characters/wizard/low/model.glb': {
    name: "Волшебник",
    emoji: "🧙‍♂️",
    color: "#ffffff",
    backgroundColor: "#8b5cf6",
    category: "character", 
    size: "medium"
  },
  'characters/rogue/low/model.glb': {
    name: "Разбойник",
    emoji: "🗡️",
    color: "#ffffff",
    backgroundColor: "#1f2937",
    category: "character",
    size: "medium"
  },
  'characters/cleric/low/model.glb': {
    name: "Жрец",
    emoji: "⛪",
    color: "#ffffff",
    backgroundColor: "#f59e0b",
    category: "character",
    size: "medium"
  },
  'characters/ranger/low/model.glb': {
    name: "Рейнджер",
    emoji: "🏹",
    color: "#ffffff",
    backgroundColor: "#059669",
    category: "character",
    size: "medium"
  },
  'characters/paladin/low/model.glb': {
    name: "Паладин",
    emoji: "🛡️⚡",
    color: "#ffffff",
    backgroundColor: "#d97706",
    category: "character",
    size: "medium"
  },
  'characters/barbarian/low/model.glb': {
    name: "Варвар",
    emoji: "🪓",
    color: "#ffffff",
    backgroundColor: "#dc2626",
    category: "character",
    size: "medium"
  },
  'characters/bard/low/model.glb': {
    name: "Бард",
    emoji: "🎵",
    color: "#ffffff",
    backgroundColor: "#ec4899",
    category: "character",
    size: "medium"
  },

  // Структуры и объекты
  'structures/tower/low/model.glb': {
    name: "Башня",
    emoji: "🏰",
    color: "#ffffff",
    backgroundColor: "#6b7280",
    category: "structure",
    size: "large"
  },
  'structures/wall/low/model.glb': {
    name: "Стена",
    emoji: "🧱",
    color: "#ffffff",
    backgroundColor: "#78716c",
    category: "structure",
    size: "large"
  },
  'structures/door/low/model.glb': {
    name: "Дверь",
    emoji: "🚪",
    color: "#ffffff",
    backgroundColor: "#92400e",
    category: "structure",
    size: "medium"
  },
  'structures/chest/low/model.glb': {
    name: "Сундук",
    emoji: "📦",
    color: "#ffffff",
    backgroundColor: "#92400e",
    category: "item",
    size: "small"
  },
  'structures/altar/low/model.glb': {
    name: "Алтарь",
    emoji: "⛩️",
    color: "#ffffff",
    backgroundColor: "#7c2d12",
    category: "structure",
    size: "medium"
  },
  'structures/pillar/low/model.glb': {
    name: "Колонна",
    emoji: "🏛️",
    color: "#ffffff",
    backgroundColor: "#a8a29e",
    category: "structure",
    size: "medium"
  },

  // Предметы и оружие
  'items/sword/low/model.glb': {
    name: "Меч",
    emoji: "⚔️",
    color: "#ffffff",
    backgroundColor: "#64748b",
    category: "item",
    size: "small"
  },
  'items/shield/low/model.glb': {
    name: "Щит",
    emoji: "🛡️",
    color: "#ffffff",
    backgroundColor: "#64748b",
    category: "item",
    size: "small"
  },
  'items/bow/low/model.glb': {
    name: "Лук",
    emoji: "🏹",
    color: "#ffffff",
    backgroundColor: "#92400e",
    category: "item",
    size: "small"
  },
  'items/staff/low/model.glb': {
    name: "Посох",
    emoji: "🪄",
    color: "#ffffff",
    backgroundColor: "#8b5cf6",
    category: "item",
    size: "small"
  }
};

// Получить аватар по storage_path
export const getAsset3DAvatar = (storagePath: string): Asset3DAvatar | null => {
  return asset3DAvatars[storagePath] || null;
};

// Получить аватар по частичному совпадению пути
export const findAsset3DAvatarByPath = (storagePath: string): Asset3DAvatar | null => {
  // Ищем точное совпадение
  const exact = asset3DAvatars[storagePath];
  if (exact) return exact;

  // Ищем по частичному совпадению
  for (const [key, avatar] of Object.entries(asset3DAvatars)) {
    if (storagePath.includes(key) || key.includes(storagePath)) {
      return avatar;
    }
  }

  // Ищем по ключевым словам в пути
  const path = storagePath.toLowerCase();
  
  if (path.includes('goblin')) return asset3DAvatars['monsters/goblin/low/model.glb'];
  if (path.includes('orc')) return asset3DAvatars['monsters/orc/low/model.glb'];
  if (path.includes('dragon')) return asset3DAvatars['monsters/dragon/low/model.glb'];
  if (path.includes('skeleton')) return asset3DAvatars['monsters/skeleton/low/model.glb'];
  if (path.includes('wolf')) return asset3DAvatars['monsters/wolf/low/model.glb'];
  if (path.includes('golem')) return asset3DAvatars['monsters/golem/low/model.glb'];
  if (path.includes('fighter')) return asset3DAvatars['monsters/fighter/low/model.glb'];
  
  if (path.includes('wizard') || path.includes('mage')) return asset3DAvatars['characters/wizard/low/model.glb'];
  if (path.includes('rogue') || path.includes('thief')) return asset3DAvatars['characters/rogue/low/model.glb'];
  if (path.includes('cleric') || path.includes('priest')) return asset3DAvatars['characters/cleric/low/model.glb'];
  if (path.includes('ranger')) return asset3DAvatars['characters/ranger/low/model.glb'];
  if (path.includes('paladin')) return asset3DAvatars['characters/paladin/low/model.glb'];
  if (path.includes('barbarian')) return asset3DAvatars['characters/barbarian/low/model.glb'];
  if (path.includes('bard')) return asset3DAvatars['characters/bard/low/model.glb'];
  
  if (path.includes('tower')) return asset3DAvatars['structures/tower/low/model.glb'];
  if (path.includes('wall')) return asset3DAvatars['structures/wall/low/model.glb'];
  if (path.includes('door')) return asset3DAvatars['structures/door/low/model.glb'];
  if (path.includes('chest')) return asset3DAvatars['structures/chest/low/model.glb'];
  if (path.includes('altar')) return asset3DAvatars['structures/altar/low/model.glb'];
  if (path.includes('pillar') || path.includes('column')) return asset3DAvatars['structures/pillar/low/model.glb'];
  
  return null;
};

// Получить все аватары определенной категории
export const getAsset3DAvatarsByCategory = (category: Asset3DAvatar['category']): Asset3DAvatar[] => {
  return Object.values(asset3DAvatars).filter(avatar => avatar.category === category);
};

// Получить все пути storage_path
export const getAllAsset3DPaths = (): string[] => {
  return Object.keys(asset3DAvatars);
};