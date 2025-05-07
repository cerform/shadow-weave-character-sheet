
import { Character } from '@/types/character';

/**
 * Нормализует данные персонажа, обеспечивая все необходимые значения по умолчанию
 */
export const normalizeCharacter = (character: Partial<Character>): Character => {
  // Установка значений по умолчанию для основных полей персонажа
  const normalized: Character = {
    name: character.name || 'Новый персонаж',
    level: character.level || 1,
    maxHp: character.maxHp || character.hitPoints?.maximum || 10,
    currentHp: character.currentHp || character.hitPoints?.current || 10,
    tempHp: character.tempHp || character.hitPoints?.temporary || 0,
    armorClass: character.armorClass || 10,
    proficiencyBonus: character.proficiencyBonus || Math.ceil((character.level || 1) / 4) + 1,
    race: character.race || '',
    subrace: character.subrace || '',
    class: character.class || character.className || '',
    subclass: character.subclass || '',
    background: character.background || '',
    alignment: character.alignment || '',
    experience: character.experience || 0,
    speed: character.speed || 30,
    temporaryHp: character.temporaryHp || 0,
    ...character
  };

  // Нормализация способностей
  if (!normalized.abilities) {
    if (normalized.stats) {
      normalized.abilities = {
        STR: normalized.stats.strength,
        DEX: normalized.stats.dexterity,
        CON: normalized.stats.constitution, 
        INT: normalized.stats.intelligence,
        WIS: normalized.stats.wisdom,
        CHA: normalized.stats.charisma,
        strength: normalized.stats.strength,
        dexterity: normalized.stats.dexterity,
        constitution: normalized.stats.constitution,
        intelligence: normalized.stats.intelligence,
        wisdom: normalized.stats.wisdom,
        charisma: normalized.stats.charisma
      };
    } else {
      normalized.abilities = {
        STR: normalized.strength || 10,
        DEX: normalized.dexterity || 10,
        CON: normalized.constitution || 10,
        INT: normalized.intelligence || 10,
        WIS: normalized.wisdom || 10,
        CHA: normalized.charisma || 10,
        strength: normalized.strength || 10,
        dexterity: normalized.dexterity || 10,
        constitution: normalized.constitution || 10,
        intelligence: normalized.intelligence || 10,
        wisdom: normalized.wisdom || 10,
        charisma: normalized.charisma || 10
      };
    }
  }

  // Проверяем наличие базовых объектов
  if (!normalized.skills) normalized.skills = {};
  if (!normalized.money) normalized.money = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  if (!normalized.features) normalized.features = [];
  if (!normalized.equipment) normalized.equipment = [];
  if (!normalized.deathSaves) normalized.deathSaves = { successes: 0, failures: 0 };
  
  // Проверяем описательные поля
  normalized.appearance = normalized.appearance || '';
  normalized.backstory = normalized.backstory || '';
  normalized.personalityTraits = normalized.personalityTraits || '';
  normalized.bonds = normalized.bonds || '';
  normalized.flaws = normalized.flaws || '';
  normalized.ideals = normalized.ideals || '';
  normalized.notes = normalized.notes || '';
  
  // Поддержка spellcasting
  if (normalized.spellcasting) {
    // Нормализуем spellcasting
    if (typeof normalized.spellcasting === 'object' && normalized.spellcasting !== null) {
      // Все в порядке
    } else {
      normalized.spellcasting = {
        ability: 'INT',
        spellSaveDC: 10,
        spellAttackBonus: 0
      };
    }
  }

  // Нормализация навыков
  if (normalized.skills) {
    Object.keys(normalized.skills).forEach(skill => {
      const skillObj = normalized.skills?.[skill];
      if (skillObj && typeof skillObj === 'object') {
        if (skillObj.ability === undefined) skillObj.ability = 'DEX';
        if (skillObj.proficient === undefined) skillObj.proficient = false;
        if (skillObj.expertise === undefined) skillObj.expertise = false;
      }
    });
  }

  // Установка значений по умолчанию для кубов хитов
  if (!normalized.hitDice) {
    normalized.hitDice = {
      total: normalized.level || 1,
      used: 0,
      dieType: 'd8',
      value: 'd8'
    };
  }

  // Добавляем поддержку remaining для hitDice
  if (normalized.hitDice && !('remaining' in normalized.hitDice)) {
    (normalized.hitDice as any).remaining = normalized.hitDice.total - normalized.hitDice.used;
  }

  return normalized;
};

// Alias for backward compatibility
export const normalizeCharacterData = normalizeCharacter;
