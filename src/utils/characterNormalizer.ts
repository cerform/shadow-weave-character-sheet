
import { Character } from '@/types/character';

export const normalizeCharacter = (character: Partial<Character>): Character => {
  // Убедимся, что у всех полей есть дефолтные значения
  const normalizedCharacter = {
    id: character.id || '',
    userId: character.userId || '',
    name: character.name || 'Новый персонаж',
    race: character.race || 'Человек',
    class: character.class || 'Воин',
    level: character.level || 1,
    background: character.background || '',
    alignment: character.alignment || 'Нейтральный',
    experience: character.experience || 0,
    abilities: {
      strength: character.abilities?.strength || character.strength || 10,
      dexterity: character.abilities?.dexterity || character.dexterity || 10,
      constitution: character.abilities?.constitution || character.constitution || 10,
      intelligence: character.abilities?.intelligence || character.intelligence || 10,
      wisdom: character.abilities?.wisdom || character.wisdom || 10,
      charisma: character.abilities?.charisma || character.charisma || 10,
      // Добавляем алиасы
      STR: character.abilities?.STR || character.abilities?.strength || character.strength || 10,
      DEX: character.abilities?.DEX || character.abilities?.dexterity || character.dexterity || 10,
      CON: character.abilities?.CON || character.abilities?.constitution || character.constitution || 10,
      INT: character.abilities?.INT || character.abilities?.intelligence || character.intelligence || 10,
      WIS: character.abilities?.WIS || character.abilities?.wisdom || character.wisdom || 10,
      CHA: character.abilities?.CHA || character.abilities?.charisma || character.charisma || 10,
    },
    proficiencyBonus: character.proficiencyBonus || 2,
    armorClass: character.armorClass || 10,
    maxHp: character.maxHp || character.hitPoints?.maximum || 10,
    currentHp: character.currentHp || character.hitPoints?.current || 10,
    temporaryHp: character.temporaryHp || character.tempHp || character.hitPoints?.temporary || 0,
    hitDice: {
      total: character.hitDice?.total || character.level || 1,
      used: character.hitDice?.used || 0,
      type: character.hitDice?.type || 'd8',
      dieType: character.hitDice?.dieType || character.hitDice?.type || 'd8',
    },
    deathSaves: character.deathSaves || { successes: 0, failures: 0 },
    inspiration: character.inspiration === undefined ? false : character.inspiration,
    conditions: Array.isArray(character.conditions) ? character.conditions : [],
    inventory: Array.isArray(character.inventory) ? character.inventory : [],
    equipment: character.equipment || [],
    spells: character.spells || [],
    proficiencies: character.proficiencies || [],
    features: character.features || [],
    notes: character.notes || '',
    resources: character.resources || {},
    savingThrowProficiencies: character.savingThrowProficiencies || [],
    skillProficiencies: character.skillProficiencies || [],
    expertise: character.expertise || [],
    skillBonuses: character.skillBonuses || {},
    spellcasting: {
      ability: character.spellcasting?.ability || 'intelligence',
      saveDC: character.spellcasting?.saveDC || 0,
      attackBonus: character.spellcasting?.attackBonus || 0,
    },
    gold: character.gold || 0,
    initiative: character.initiative || 0,
    lastDiceRoll: {
      formula: character.lastDiceRoll?.formula || '',
      rolls: character.lastDiceRoll?.rolls || [],
      total: character.lastDiceRoll?.total || 0,
    },
    languages: Array.isArray(character.languages) ? character.languages : [],
    subrace: character.subrace || ''
  } as Character;

  return normalizedCharacter;
};
