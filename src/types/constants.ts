
// Constants for D&D 5e game mechanics

// Ability score limits
export const ABILITY_SCORE_CAPS = {
  MIN: 1,               // Minimum ability score
  MAX: 30,              // Theoretical maximum (gods/artifacts)
  DEFAULT: 10,          // Default starting value
  BASE_CAP: 20,         // Normal character maximum
  EPIC_CAP: 22,         // Epic level maximum (level 10+)
  LEGENDARY_CAP: 24     // Legendary maximum (level 16+)
};

// Rest types
export const REST_TYPES = {
  SHORT: 'short-rest',
  LONG: 'long-rest'
};

// Spell sources
export const SPELL_SOURCES = {
  PHB: 'Player\'s Handbook',
  XGE: 'Xanathar\'s Guide to Everything',
  TCE: 'Tasha\'s Cauldron of Everything',
  SCAG: 'Sword Coast Adventurer\'s Guide',
  EGW: 'Explorer\'s Guide to Wildemount',
  AI: 'Acquisitions Incorporated',
  GGR: 'Guildmasters\' Guide to Ravnica',
  MOT: 'Mythic Odysseys of Theros',
  ERLW: 'Eberron: Rising from the Last War',
  IDROTF: 'Icewind Dale: Rime of the Frostmaiden',
  FTD: 'Fizban\'s Treasury of Dragons',
  SCC: 'Strixhaven: Curriculum of Chaos',
  HOMEMADE: 'Homemade'
};

// Game mechanics constants
export const GAME_MECHANICS = {
  DEFAULT_PROFICIENCY: 2,
  MAX_LEVEL: 20,
  XP_THRESHOLDS: [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ],
  HIT_DICE: {
    BARBARIAN: 'd12',
    FIGHTER: 'd10',
    PALADIN: 'd10', 
    RANGER: 'd10',
    BARD: 'd8',
    CLERIC: 'd8',
    DRUID: 'd8',
    MONK: 'd8',
    ROGUE: 'd8',
    WARLOCK: 'd8',
    ARTIFICER: 'd8',
    SORCERER: 'd6',
    WIZARD: 'd6'
  }
};

// Define skill types and mapping
export interface Skill {
  name: string;
  ability: string;
}

// List of all available skills in D&D 5e
export const SKILL_LIST: Skill[] = [
  { name: 'Акробатика', ability: 'DEX' },
  { name: 'Анализ', ability: 'INT' },
  { name: 'Атлетика', ability: 'STR' },
  { name: 'Внимательность', ability: 'WIS' },
  { name: 'Выживание', ability: 'WIS' },
  { name: 'Выступление', ability: 'CHA' },
  { name: 'Запугивание', ability: 'CHA' },
  { name: 'История', ability: 'INT' },
  { name: 'Ловкость рук', ability: 'DEX' },
  { name: 'Магия', ability: 'INT' },
  { name: 'Медицина', ability: 'WIS' },
  { name: 'Обман', ability: 'CHA' },
  { name: 'Природа', ability: 'INT' },
  { name: 'Проницательность', ability: 'WIS' },
  { name: 'Религия', ability: 'INT' },
  { name: 'Скрытность', ability: 'DEX' },
  { name: 'Убеждение', ability: 'CHA' },
  { name: 'Уход за животными', ability: 'WIS' }
];

// Map skill names to corresponding ability scores
export const SKILL_MAP: Record<string, string> = {
  'Акробатика': 'DEX',
  'Анализ': 'INT',
  'Атлетика': 'STR',
  'Внимательность': 'WIS',
  'Выживание': 'WIS',
  'Выступление': 'CHA',
  'Запугивание': 'CHA',
  'История': 'INT',
  'Ловкость рук': 'DEX',
  'Магия': 'INT',
  'Медицина': 'WIS',
  'Обман': 'CHA',
  'Природа': 'INT',
  'Проницательность': 'WIS',
  'Религия': 'INT',
  'Скрытность': 'DEX',
  'Убеждение': 'CHA',
  'Уход за животными': 'WIS'
};
