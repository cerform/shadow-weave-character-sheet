
// Этот файл экспортирует пути к ассетам для удобного импорта в компонентах

// Пути к аватарам
export const avatars = {
  default: "/assets/avatars/default-avatar.png",
  dm: "/assets/avatars/dm-avatar.png",
  player: "/assets/avatars/player-avatar.png",
};

// Пути к токенам
export const tokens = {
  // Персонажи
  characters: {
    warrior: "/assets/tokens/characters/warrior.png",
    mage: "/assets/tokens/characters/mage.png",
    rogue: "/assets/tokens/characters/rogue.png",
    cleric: "/assets/tokens/characters/cleric.png",
    druid: "/assets/tokens/characters/druid.png",
  },
  
  // Монстры
  monsters: {
    goblin: "/assets/tokens/monsters/goblin.png",
    dragon: "/assets/tokens/monsters/dragon.png",
    zombie: "/assets/tokens/monsters/zombie.png",
    skeleton: "/assets/tokens/monsters/skeleton.png",
    troll: "/assets/tokens/monsters/troll.png",
  },
  
  // НПС
  npcs: {
    villager: "/assets/tokens/npcs/villager.png",
    merchant: "/assets/tokens/npcs/merchant.png",
    guard: "/assets/tokens/npcs/guard.png",
    king: "/assets/tokens/npcs/king.png",
    innkeeper: "/assets/tokens/npcs/innkeeper.png",
  }
};

// Пути к картам
export const maps = {
  dungeons: {
    crypt: "/assets/maps/dungeons/crypt.jpg",
    cave: "/assets/maps/dungeons/cave.jpg",
    ruins: "/assets/maps/dungeons/ruins.jpg",
  },
  
  cities: {
    capital: "/assets/maps/cities/capital.jpg",
    village: "/assets/maps/cities/village.jpg",
    port: "/assets/maps/cities/port.jpg",
  },
  
  wilderness: {
    forest: "/assets/maps/wilderness/forest.jpg",
    mountains: "/assets/maps/wilderness/mountains.jpg",
    desert: "/assets/maps/wilderness/desert.jpg",
  }
};

// Пути к иконкам
export const icons = {
  classes: {
    warrior: "/assets/icons/classes/warrior.png",
    mage: "/assets/icons/classes/mage.png",
    rogue: "/assets/icons/classes/rogue.png",
    cleric: "/assets/icons/classes/cleric.png",
    druid: "/assets/icons/classes/druid.png",
  },
  
  spells: {
    fire: "/assets/icons/spells/fire.png",
    ice: "/assets/icons/spells/ice.png",
    healing: "/assets/icons/spells/healing.png",
    protection: "/assets/icons/spells/protection.png",
    summoning: "/assets/icons/spells/summoning.png",
  },
  
  items: {
    sword: "/assets/icons/items/sword.png",
    bow: "/assets/icons/items/bow.png",
    potion: "/assets/icons/items/potion.png",
    shield: "/assets/icons/items/shield.png",
    scroll: "/assets/icons/items/scroll.png",
  },
  
  ui: {
    dice: "/assets/icons/ui/dice.png",
    book: "/assets/icons/ui/book.png",
    settings: "/assets/icons/ui/settings.png",
    combat: "/assets/icons/ui/combat.png",
    chat: "/assets/icons/ui/chat.png",
  }
};

// Пути к фонам и заставкам
export const backgrounds = {
  // Основные фоны
  login: "/assets/backgrounds/login-bg.jpg",
  character: "/assets/backgrounds/character-bg.jpg",
  battle: "/assets/backgrounds/battle-bg.jpg",
  
  // Фоны для предысторий
  backgrounds: {
    acolyte: "/assets/backgrounds/backgrounds/acolyte-bg.jpg",
    criminal: "/assets/backgrounds/backgrounds/criminal-bg.jpg",
    folk_hero: "/assets/backgrounds/backgrounds/folk-hero-bg.jpg",
    noble: "/assets/backgrounds/backgrounds/noble-bg.jpg",
    sage: "/assets/backgrounds/backgrounds/sage-bg.jpg",
    soldier: "/assets/backgrounds/backgrounds/soldier-bg.jpg",
    charlatan: "/assets/backgrounds/backgrounds/charlatan-bg.jpg",
    entertainer: "/assets/backgrounds/backgrounds/entertainer-bg.jpg",
    guild_artisan: "/assets/backgrounds/backgrounds/guild-artisan-bg.jpg",
    hermit: "/assets/backgrounds/backgrounds/hermit-bg.jpg",
    outlander: "/assets/backgrounds/backgrounds/outlander-bg.jpg",
    sailor: "/assets/backgrounds/backgrounds/sailor-bg.jpg",
    urchin: "/assets/backgrounds/backgrounds/urchin-bg.jpg",
  },
  
  // Фоны для рас
  races: {
    human: "/assets/backgrounds/races/human-bg.jpg",
    elf: "/assets/backgrounds/races/elf-bg.jpg",
    dwarf: "/assets/backgrounds/races/dwarf-bg.jpg",
    halfling: "/assets/backgrounds/races/halfling-bg.jpg",
    dragonborn: "/assets/backgrounds/races/dragonborn-bg.jpg",
    gnome: "/assets/backgrounds/races/gnome-bg.jpg",
    half_elf: "/assets/backgrounds/races/half-elf-bg.jpg",
    half_orc: "/assets/backgrounds/races/half-orc-bg.jpg",
    tiefling: "/assets/backgrounds/races/tiefling-bg.jpg",
  },
  
  // Фоны для классов
  classes: {
    barbarian: "/assets/backgrounds/classes/barbarian-bg.jpg",
    bard: "/assets/backgrounds/classes/bard-bg.jpg", 
    cleric: "/assets/backgrounds/classes/cleric-bg.jpg",
    druid: "/assets/backgrounds/classes/druid-bg.jpg",
    fighter: "/assets/backgrounds/classes/fighter-bg.jpg",
    monk: "/assets/backgrounds/classes/monk-bg.jpg",
    paladin: "/assets/backgrounds/classes/paladin-bg.jpg",
    ranger: "/assets/backgrounds/classes/ranger-bg.jpg",
    rogue: "/assets/backgrounds/classes/rogue-bg.jpg",
    sorcerer: "/assets/backgrounds/classes/sorcerer-bg.jpg",
    warlock: "/assets/backgrounds/classes/warlock-bg.jpg",
    wizard: "/assets/backgrounds/classes/wizard-bg.jpg",
  },
  
  // Дополнительные фоны окружения
  environments: {
    tavern: "/assets/backgrounds/environments/tavern-bg.jpg",
    castle: "/assets/backgrounds/environments/castle-bg.jpg",
    dungeon: "/assets/backgrounds/environments/dungeon-bg.jpg",
    forest: "/assets/backgrounds/environments/forest-bg.jpg",
    mountains: "/assets/backgrounds/environments/mountains-bg.jpg", 
    city: "/assets/backgrounds/environments/city-bg.jpg",
    village: "/assets/backgrounds/environments/village-bg.jpg",
    coast: "/assets/backgrounds/environments/coast-bg.jpg",
    desert: "/assets/backgrounds/environments/desert-bg.jpg",
  },
  
  // Фоны для разных этапов создания персонажа
  creation: {
    step1: "/assets/backgrounds/creation/race-selection-bg.jpg", 
    step2: "/assets/backgrounds/creation/class-selection-bg.jpg",
    step3: "/assets/backgrounds/creation/abilities-bg.jpg",
    step4: "/assets/backgrounds/creation/background-bg.jpg", 
    step5: "/assets/backgrounds/creation/equipment-bg.jpg",
    step6: "/assets/backgrounds/creation/spells-bg.jpg",
    step7: "/assets/backgrounds/creation/review-bg.jpg",
  }
};
