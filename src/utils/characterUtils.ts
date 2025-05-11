
import { Character, AbilityScores } from '@/types/character';

/**
 * Calculate ability score bonuses based on race
 */
export function calculateStatBonuses(race: string): Partial<AbilityScores> {
  // Default empty bonuses
  const bonuses: Partial<AbilityScores> = {
    STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0
  };
  
  // Бонусы характеристик по расе согласно Книге Игрока
  switch (race.toLowerCase()) {
    case 'человек':
    case 'human':
      // Люди получают +1 ко всем характеристикам
      bonuses.STR = 1;
      bonuses.DEX = 1;
      bonuses.CON = 1;
      bonuses.INT = 1;
      bonuses.WIS = 1;
      bonuses.CHA = 1;
      break;
    
    case 'дварф':
    case 'dwarf':
    case 'горный дварф':
    case 'mountain dwarf':
      // Дварфы получают +2 к Телосложению
      bonuses.CON = 2;
      // Горные дварфы дополнительно получают +2 к Силе
      if (race.toLowerCase().includes('горный') || race.toLowerCase().includes('mountain')) {
        bonuses.STR = 2;
      }
      break;
      
    case 'холмовой дварф':
    case 'hill dwarf':
      // Холмовые дварфы получают +2 к Телосложению и +1 к Мудрости
      bonuses.CON = 2;
      bonuses.WIS = 1;
      break;
    
    case 'эльф':
    case 'elf':
    case 'высший эльф':
    case 'high elf':
      // Эльфы получают +2 к Ловкости
      bonuses.DEX = 2;
      // Высшие эльфы дополнительно получают +1 к Интеллекту
      if (race.toLowerCase().includes('высший') || race.toLowerCase().includes('high')) {
        bonuses.INT = 1;
      }
      break;
      
    case 'лесной эльф':
    case 'wood elf':
      // Лесные эльфы получают +2 к Ловкости и +1 к Мудрости
      bonuses.DEX = 2;
      bonuses.WIS = 1;
      break;
    
    case 'дроу':
    case 'тёмный эльф':
    case 'dark elf':
      // Дроу получают +2 к Ловкости и +1 к Харизме
      bonuses.DEX = 2;
      bonuses.CHA = 1;
      break;
    
    case 'полуэльф':
    case 'half-elf':
      // Полуэльфы получают +2 к Харизме и +1 к двум другим характеристикам на выбор
      // По умолчанию, мы добавляем +1 к Ловкости и Интеллекту
      bonuses.CHA = 2;
      bonuses.DEX = 1;
      bonuses.INT = 1;
      break;
      
    case 'полуорк':
    case 'half-orc':
      // Полуорки получают +2 к Силе и +1 к Телосложению
      bonuses.STR = 2;
      bonuses.CON = 1;
      break;
      
    case 'полурослик':
    case 'halfling':
    case 'легконогий полурослик':
    case 'lightfoot halfling':
      // Полурослики получают +2 к Ловкости
      bonuses.DEX = 2;
      // Легконогие дополнительно получают +1 к Харизме
      if (race.toLowerCase().includes('легконогий') || race.toLowerCase().includes('lightfoot')) {
        bonuses.CHA = 1;
      }
      break;
      
    case 'коренастый полурослик':
    case 'stout halfling':
      // Коренастые полурослики получают +2 к Ловкости и +1 к Телосложению
      bonuses.DEX = 2;
      bonuses.CON = 1;
      break;
      
    case 'гном':
    case 'gnome':
    case 'скальный гном':
    case 'rock gnome':
      // Гномы получают +2 к Интеллекту
      bonuses.INT = 2;
      // Скальные гномы дополнительно получают +1 к Телосложению
      if (race.toLowerCase().includes('скальный') || race.toLowerCase().includes('rock')) {
        bonuses.CON = 1;
      }
      break;
      
    case 'лесной гном':
    case 'forest gnome':
      // Лесные гномы получают +2 к Интеллекту и +1 к Ловкости
      bonuses.INT = 2;
      bonuses.DEX = 1;
      break;
      
    case 'тифлинг':
    case 'tiefling':
      // Тифлинги получают +2 к Харизме и +1 к Интеллекту
      bonuses.CHA = 2;
      bonuses.INT = 1;
      break;
      
    case 'драконорожденный':
    case 'dragonborn':
      // Драконорожденные получают +2 к Силе и +1 к Харизме
      bonuses.STR = 2;
      bonuses.CHA = 1;
      break;
  }
  
  return bonuses;
}

/**
 * Calculate ability modifier from ability score
 */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus from character level
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level + 7) / 4);
}

/**
 * Check if a class is a magic class
 */
export function isMagicClass(characterClass: string): boolean {
  const magicClasses = [
    'бард', 'волшебник', 'друид', 'жрец', 'колдун', 'паладин', 'следопыт', 'чародей', 
    'bard', 'wizard', 'druid', 'cleric', 'warlock', 'paladin', 'ranger', 'sorcerer'
  ];
  
  return magicClasses.includes(characterClass.toLowerCase());
}

/**
 * Convert a partial character to a complete character
 */
export function convertToCharacter(partial: Partial<Character>): Character {
  const now = new Date().toISOString();
  return {
    id: partial.id || crypto.randomUUID(),
    name: partial.name || 'Безымянный',
    race: partial.race || 'Человек',
    class: partial.class || 'Воин',
    level: partial.level || 1,
    abilities: partial.abilities || {
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    },
    background: partial.background || '',
    alignment: partial.alignment || 'Нейтральный',
    experience: partial.experience || 0,
    personalityTraits: partial.personalityTraits || '',
    ideals: partial.ideals || '',
    bonds: partial.bonds || '',
    flaws: partial.flaws || '',
    hitPoints: partial.hitPoints || {
      current: 10,
      maximum: 10,
      temporary: 0
    },
    hitDice: partial.hitDice || {
      total: partial.level || 1,
      used: 0,
      dieType: 'd8',
      value: 'd8',
      remaining: partial.level || 1
    },
    spells: partial.spells || [],
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
    lastUsed: partial.lastUsed || now
  };
}
