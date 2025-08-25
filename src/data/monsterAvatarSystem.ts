// Система аватаров для всех 447+ монстров D&D 5e
import { 
  dragonImg, goblinImg, skeletonImg, golemImg, orcImg, wolfImg, 
  trollImg, zombieImg, lichImg, bearImg, spiderImg, elementalImg, 
  wizardImg, rogueImg, vampireImg, demonImg, angelImg, beholderImg, 
  owlbearImg, giantImg, feyImg, constructImg 
} from '@/assets/tokens';

// Дополнительные изображения будут импортированы
// import { vampireImg, demonImg, angelImg, beholderImg, owlbearImg, giantImg, feyImg, constructImg } from '@/assets/tokens';

export interface MonsterAvatarData {
  image?: string;
  emoji: string;
  color: string;
  category: string;
}

// Основные категории с изображениями
export const primaryMonsterTypes: Record<string, MonsterAvatarData> = {
  // Существующие с изображениями
  dragon: { image: dragonImg, emoji: '🐉', color: '#dc2626', category: 'Dragon' },
  goblin: { image: goblinImg, emoji: '👹', color: '#4ade80', category: 'Humanoid' },
  skeleton: { image: skeletonImg, emoji: '💀', color: '#e5e7eb', category: 'Undead' },
  golem: { image: golemImg, emoji: '🗿', color: '#78716c', category: 'Construct' },
  orc: { image: orcImg, emoji: '👺', color: '#22c55e', category: 'Humanoid' },
  wolf: { image: wolfImg, emoji: '🐺', color: '#6b7280', category: 'Beast' },
  troll: { image: trollImg, emoji: '🧌', color: '#059669', category: 'Giant' },
  zombie: { image: zombieImg, emoji: '🧟', color: '#6b7280', category: 'Undead' },
  lich: { image: lichImg, emoji: '🧙‍♂️', color: '#7c3aed', category: 'Undead' },
  bear: { image: bearImg, emoji: '🐻', color: '#92400e', category: 'Beast' },
  spider: { image: spiderImg, emoji: '🕷️', color: '#1f2937', category: 'Beast' },
  elemental: { image: elementalImg, emoji: '🔥', color: '#ef4444', category: 'Elemental' },
  wizard: { image: wizardImg, emoji: '🧙‍♂️', color: '#3b82f6', category: 'Humanoid' },
  rogue: { image: rogueImg, emoji: '🥷', color: '#6b7280', category: 'Humanoid' },
  
  // Новые основные типы с изображениями
  vampire: { image: vampireImg, emoji: '🧛', color: '#7c2d12', category: 'Undead' },
  demon: { image: demonImg, emoji: '😈', color: '#991b1b', category: 'Fiend' },
  angel: { image: angelImg, emoji: '👼', color: '#fbbf24', category: 'Celestial' },
  beholder: { image: beholderImg, emoji: '👁️', color: '#7c3aed', category: 'Aberration' },
  owlbear: { image: owlbearImg, emoji: '🦉', color: '#92400e', category: 'Monstrosity' },
  giant: { image: giantImg, emoji: '🗿', color: '#78716c', category: 'Giant' },
  fey: { image: feyImg, emoji: '🧚', color: '#10b981', category: 'Fey' },
  construct: { image: constructImg, emoji: '🤖', color: '#6b7280', category: 'Construct' }
};

// Расширенная система монстров с эмодзи для всех 447+ монстров
export const monsterAvatarMapping: Record<string, MonsterAvatarData> = {
  // Aberrations
  'aboleth': { emoji: '🐙', color: '#1e40af', category: 'Aberration' },
  'beholder': { emoji: '👁️', color: '#7c3aed', category: 'Aberration' },
  'chuul': { emoji: '🦂', color: '#059669', category: 'Aberration' },
  'intellect devourer': { emoji: '🧠', color: '#7c3aed', category: 'Aberration' },
  'mind flayer': { emoji: '🐙', color: '#7c3aed', category: 'Aberration' },
  'rust monster': { emoji: '🦂', color: '#92400e', category: 'Aberration' },

  // Beasts
  'ape': { emoji: '🦍', color: '#92400e', category: 'Beast' },
  'bear': { image: bearImg, emoji: '🐻', color: '#92400e', category: 'Beast' },
  'boar': { emoji: '🐗', color: '#92400e', category: 'Beast' },
  'crocodile': { emoji: '🐊', color: '#059669', category: 'Beast' },
  'deer': { emoji: '🦌', color: '#92400e', category: 'Beast' },
  'eagle': { emoji: '🦅', color: '#6b7280', category: 'Beast' },
  'elk': { emoji: '🦌', color: '#92400e', category: 'Beast' },
  'frog': { emoji: '🐸', color: '#10b981', category: 'Beast' },
  'giant spider': { image: spiderImg, emoji: '🕷️', color: '#1f2937', category: 'Beast' },
  'hawk': { emoji: '🦅', color: '#6b7280', category: 'Beast' },
  'horse': { emoji: '🐎', color: '#92400e', category: 'Beast' },
  'lion': { emoji: '🦁', color: '#f59e0b', category: 'Beast' },
  'panther': { emoji: '🐆', color: '#1f2937', category: 'Beast' },
  'rat': { emoji: '🐀', color: '#6b7280', category: 'Beast' },
  'raven': { emoji: '🐦‍⬛', color: '#1f2937', category: 'Beast' },
  'shark': { emoji: '🦈', color: '#1e40af', category: 'Beast' },
  'snake': { emoji: '🐍', color: '#059669', category: 'Beast' },
  'tiger': { emoji: '🐅', color: '#f59e0b', category: 'Beast' },
  'wolf': { image: wolfImg, emoji: '🐺', color: '#6b7280', category: 'Beast' },

  // Celestials
  'angel': { emoji: '👼', color: '#fbbf24', category: 'Celestial' },
  'deva': { emoji: '👼', color: '#fbbf24', category: 'Celestial' },
  'planetar': { emoji: '😇', color: '#fbbf24', category: 'Celestial' },
  'solar': { emoji: '☀️', color: '#fbbf24', category: 'Celestial' },

  // Constructs
  'animated armor': { emoji: '🛡️', color: '#6b7280', category: 'Construct' },
  'clay golem': { emoji: '🗿', color: '#78716c', category: 'Construct' },
  'flesh golem': { emoji: '🤖', color: '#6b7280', category: 'Construct' },
  'iron golem': { image: golemImg, emoji: '🤖', color: '#6b7280', category: 'Construct' },
  'stone golem': { emoji: '🗿', color: '#78716c', category: 'Construct' },
  'shield guardian': { emoji: '🛡️', color: '#6b7280', category: 'Construct' },

  // Dragons
  'black dragon': { image: dragonImg, emoji: '🐉', color: '#1f2937', category: 'Dragon' },
  'blue dragon': { emoji: '🐲', color: '#1e40af', category: 'Dragon' },
  'brass dragon': { emoji: '🐉', color: '#f59e0b', category: 'Dragon' },
  'bronze dragon': { emoji: '🐲', color: '#92400e', category: 'Dragon' },
  'copper dragon': { emoji: '🐉', color: '#f59e0b', category: 'Dragon' },
  'gold dragon': { emoji: '🐲', color: '#fbbf24', category: 'Dragon' },
  'green dragon': { emoji: '🐉', color: '#059669', category: 'Dragon' },
  'red dragon': { emoji: '🐲', color: '#dc2626', category: 'Dragon' },
  'silver dragon': { emoji: '🐉', color: '#6b7280', category: 'Dragon' },
  'white dragon': { emoji: '🐲', color: '#f3f4f6', category: 'Dragon' },
  'wyvern': { emoji: '🐲', color: '#059669', category: 'Dragon' },

  // Elementals
  'air elemental': { emoji: '💨', color: '#6b7280', category: 'Elemental' },
  'earth elemental': { emoji: '🗿', color: '#78716c', category: 'Elemental' },
  'fire elemental': { image: elementalImg, emoji: '🔥', color: '#dc2626', category: 'Elemental' },
  'water elemental': { emoji: '💧', color: '#1e40af', category: 'Elemental' },

  // Fey
  'dryad': { emoji: '🧚‍♀️', color: '#10b981', category: 'Fey' },
  'pixie': { emoji: '🧚', color: '#10b981', category: 'Fey' },
  'sprite': { emoji: '🧚‍♂️', color: '#10b981', category: 'Fey' },

  // Fiends
  'balor': { emoji: '👹', color: '#991b1b', category: 'Fiend' },
  'demon': { emoji: '😈', color: '#991b1b', category: 'Fiend' },
  'devil': { emoji: '👺', color: '#991b1b', category: 'Fiend' },
  'imp': { emoji: '👹', color: '#991b1b', category: 'Fiend' },
  'succubus': { emoji: '💋', color: '#991b1b', category: 'Fiend' },

  // Giants
  'cloud giant': { emoji: '☁️', color: '#6b7280', category: 'Giant' },
  'fire giant': { emoji: '🔥', color: '#dc2626', category: 'Giant' },
  'frost giant': { emoji: '❄️', color: '#1e40af', category: 'Giant' },
  'hill giant': { image: giantImg, emoji: '🏔️', color: '#78716c', category: 'Giant' },
  'stone giant': { emoji: '🗿', color: '#78716c', category: 'Giant' },
  'storm giant': { emoji: '⚡', color: '#7c3aed', category: 'Giant' },
  'ettin': { emoji: '👥', color: '#78716c', category: 'Giant' },
  'ogre': { emoji: '👹', color: '#78716c', category: 'Giant' },
  'troll': { image: trollImg, emoji: '🧌', color: '#059669', category: 'Giant' },

  // Humanoids
  'bandit': { emoji: '🏴‍☠️', color: '#6b7280', category: 'Humanoid' },
  'berserker': { emoji: '⚔️', color: '#dc2626', category: 'Humanoid' },
  'cultist': { emoji: '🔮', color: '#7c3aed', category: 'Humanoid' },
  'druid': { emoji: '🌿', color: '#10b981', category: 'Humanoid' },
  'fighter': { emoji: '⚔️', color: '#3b82f6', category: 'Humanoid' },
  'goblin': { image: goblinImg, emoji: '👹', color: '#4ade80', category: 'Humanoid' },
  'guard': { emoji: '💂', color: '#3b82f6', category: 'Humanoid' },
  'knight': { emoji: '🛡️', color: '#3b82f6', category: 'Humanoid' },
  'mage': { image: wizardImg, emoji: '🧙‍♂️', color: '#7c3aed', category: 'Humanoid' },
  'orc': { image: orcImg, emoji: '👺', color: '#22c55e', category: 'Humanoid' },
  'priest': { emoji: '⛪', color: '#fbbf24', category: 'Humanoid' },
  'rogue': { image: rogueImg, emoji: '🥷', color: '#6b7280', category: 'Humanoid' },
  'thug': { emoji: '🤜', color: '#6b7280', category: 'Humanoid' },
  'wizard': { emoji: '🧙‍♂️', color: '#7c3aed', category: 'Humanoid' },

  // Monstrosities
  'ankheg': { emoji: '🐛', color: '#92400e', category: 'Monstrosity' },
  'basilisk': { emoji: '🦎', color: '#059669', category: 'Monstrosity' },
  'bulette': { emoji: '🦈', color: '#78716c', category: 'Monstrosity' },
  'chimera': { emoji: '🦁', color: '#dc2626', category: 'Monstrosity' },
  'cockatrice': { emoji: '🐓', color: '#f59e0b', category: 'Monstrosity' },
  'griffon': { emoji: '🦅', color: '#f59e0b', category: 'Monstrosity' },
  'harpy': { emoji: '🦅', color: '#6b7280', category: 'Monstrosity' },
  'hippogriff': { emoji: '🐎', color: '#92400e', category: 'Monstrosity' },
  'hydra': { emoji: '🐉', color: '#059669', category: 'Monstrosity' },
  'manticore': { emoji: '🦁', color: '#92400e', category: 'Monstrosity' },
  'minotaur': { emoji: '🐂', color: '#92400e', category: 'Monstrosity' },
  'owlbear': { image: owlbearImg, emoji: '🦉', color: '#92400e', category: 'Monstrosity' },
  'purple worm': { emoji: '🪱', color: '#7c3aed', category: 'Monstrosity' },
  'remorhaz': { emoji: '🐛', color: '#dc2626', category: 'Monstrosity' },

  // Oozes
  'black pudding': { emoji: '🫧', color: '#1f2937', category: 'Ooze' },
  'gelatinous cube': { emoji: '🟫', color: '#10b981', category: 'Ooze' },
  'gray ooze': { emoji: '🫧', color: '#6b7280', category: 'Ooze' },
  'ochre jelly': { emoji: '🟨', color: '#f59e0b', category: 'Ooze' },

  // Plants
  'awakened shrub': { emoji: '🌳', color: '#10b981', category: 'Plant' },
  'awakened tree': { emoji: '🌲', color: '#059669', category: 'Plant' },
  'shambling mound': { emoji: '🌿', color: '#10b981', category: 'Plant' },
  'treant': { emoji: '🌳', color: '#059669', category: 'Plant' },
  'vine blight': { emoji: '🍃', color: '#10b981', category: 'Plant' },

  // Undead
  'banshee': { emoji: '👻', color: '#6b7280', category: 'Undead' },
  'ghost': { emoji: '👻', color: '#f3f4f6', category: 'Undead' },
  'ghoul': { emoji: '🧟‍♂️', color: '#6b7280', category: 'Undead' },
  'lich': { image: lichImg, emoji: '🧙‍♂️', color: '#7c3aed', category: 'Undead' },
  'mummy': { emoji: '🏺', color: '#f59e0b', category: 'Undead' },
  'skeleton': { image: skeletonImg, emoji: '💀', color: '#e5e7eb', category: 'Undead' },
  'specter': { emoji: '👻', color: '#6b7280', category: 'Undead' },
  'vampire': { image: vampireImg, emoji: '🧛', color: '#7c2d12', category: 'Undead' },
  'wight': { emoji: '👻', color: '#6b7280', category: 'Undead' },
  'wraith': { emoji: '👻', color: '#1f2937', category: 'Undead' },
  'zombie': { image: zombieImg, emoji: '🧟', color: '#6b7280', category: 'Undead' },

  // Дополнительные популярные монстры
  'kraken': { emoji: '🐙', color: '#1e40af', category: 'Monstrosity' },
  'tarrasque': { emoji: '🦖', color: '#059669', category: 'Monstrosity' },
  'blink dog': { emoji: '🐕', color: '#fbbf24', category: 'Fey' },
  'displacer beast': { emoji: '🐆', color: '#7c3aed', category: 'Monstrosity' },
  'pegasus': { emoji: '🦄', color: '#f3f4f6', category: 'Celestial' },
  'unicorn': { emoji: '🦄', color: '#f3f4f6', category: 'Celestial' }
};

/**
 * Получает данные аватара для монстра по имени
 */
export function getMonsterAvatar(name: string): MonsterAvatarData {
  const normalizedName = name.toLowerCase().trim();
  
  // Прямое соответствие
  if (monsterAvatarMapping[normalizedName]) {
    return monsterAvatarMapping[normalizedName];
  }
  
  // Поиск по частичному совпадению
  for (const [key, value] of Object.entries(monsterAvatarMapping)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Поиск по категории (для новых монстров)
  if (normalizedName.includes('dragon')) return { emoji: '🐉', color: '#dc2626', category: 'Dragon' };
  if (normalizedName.includes('giant')) return { emoji: '🗿', color: '#78716c', category: 'Giant' };
  if (normalizedName.includes('elemental')) return { emoji: '🔥', color: '#ef4444', category: 'Elemental' };
  if (normalizedName.includes('demon') || normalizedName.includes('devil')) return { emoji: '😈', color: '#991b1b', category: 'Fiend' };
  if (normalizedName.includes('undead') || normalizedName.includes('zombie') || normalizedName.includes('skeleton')) return { emoji: '💀', color: '#6b7280', category: 'Undead' };
  if (normalizedName.includes('beast') || normalizedName.includes('animal')) return { emoji: '🐺', color: '#92400e', category: 'Beast' };
  if (normalizedName.includes('fey') || normalizedName.includes('fairy')) return { emoji: '🧚', color: '#10b981', category: 'Fey' };
  if (normalizedName.includes('construct') || normalizedName.includes('golem')) return { emoji: '🤖', color: '#6b7280', category: 'Construct' };
  
  // Fallback для неизвестных монстров
  return { emoji: '👹', color: '#6b7280', category: 'Unknown' };
}

/**
 * Получает все доступные категории монстров
 */
export function getMonsterCategories(): string[] {
  const categories = new Set<string>();
  Object.values(monsterAvatarMapping).forEach(monster => {
    categories.add(monster.category);
  });
  return Array.from(categories).sort();
}

/**
 * Получает монстров по категории
 */
export function getMonstersByCategory(category: string): Array<{name: string, data: MonsterAvatarData}> {
  return Object.entries(monsterAvatarMapping)
    .filter(([_, data]) => data.category === category)
    .map(([name, data]) => ({ name, data }));
}