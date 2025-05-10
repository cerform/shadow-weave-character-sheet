
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
