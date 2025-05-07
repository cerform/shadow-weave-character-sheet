
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Определяет способность заклинаний для класса персонажа
 * @param characterClass название класса персонажа
 * @returns название способности для заклинаний
 */
export function getSpellcastingAbility(characterClass: string): 'intelligence' | 'wisdom' | 'charisma' {
  const lowerClass = characterClass.toLowerCase();
  
  if (lowerClass.includes('волшебник') || lowerClass.includes('wizard') || 
      lowerClass.includes('артифайсер') || lowerClass.includes('artificer')) {
    return 'intelligence';
  }
  
  if (lowerClass.includes('жрец') || lowerClass.includes('cleric') || 
      lowerClass.includes('друид') || lowerClass.includes('druid') ||
      lowerClass.includes('следопыт') || lowerClass.includes('ranger')) {
    return 'wisdom';
  }
  
  // По умолчанию для остальных (бард, чародей, колдун, паладин)
  return 'charisma';
}

/**
 * Вычисляет модификатор основной характеристики заклинаний
 * @param character персонаж
 * @returns модификатор основной характеристики заклинаний
 */
export function getSpellcastingAbilityModifier(character: Character): number {
  const spellcastingAbility = getSpellcastingAbility(character.class);
  const abilityScore = character.abilities?.[spellcastingAbility] || 10;
  
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Фильтрует заклинания по классу и уровню
 * @param spells список заклинаний
 * @param className название класса
 * @param level уровень заклинаний
 * @returns отфильтрованный список заклинаний
 */
export function filterSpellsByClassAndLevel(
  spells: CharacterSpell[],
  className: string,
  level?: number
): CharacterSpell[] {
  return spells.filter(spell => {
    // Проверяем класс
    const matchesClass = Array.isArray(spell.classes) 
      ? spell.classes.some(c => c.toLowerCase().includes(className.toLowerCase()))
      : typeof spell.classes === 'string' && 
        spell.classes.toLowerCase().includes(className.toLowerCase());
    
    // Если level не указан, возвращаем все заклинания данного класса
    if (level === undefined) {
      return matchesClass;
    }
    
    // Иначе фильтруем еще и по уровню
    return matchesClass && spell.level === level;
  });
}

/**
 * Преобразует объект заклинаний для состояния
 * @param spells массив заклинаний
 * @returns объект заклинаний для состояния
 */
export function convertSpellsForState(spells: CharacterSpell[]): Record<string, any> {
  const result: Record<string, any> = {};
  
  spells.forEach(spell => {
    result[spell.id || spell.name] = { ...spell };
  });
  
  return result;
}

/**
 * Преобразует данные в формат для отображения заклинаний
 * @param spell данные заклинания
 * @returns данные для отображения
 */
export function convertToSpellData(spell: CharacterSpell | string): SpellData {
  if (typeof spell === 'string') {
    return {
      id: spell,
      name: spell,
      level: 0,
      school: '',
      castingTime: '',
      range: '',
      components: '',
      duration: '',
      description: '',
      classes: [],
      ritual: false,
      concentration: false
    };
  }
  
  return {
    id: spell.id || spell.name,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
}

/**
 * Нормализует заклинания персонажа
 * @param spells заклинания персонажа
 * @returns нормализованные данные заклинаний
 */
export function normalizeSpells(spells: (string | CharacterSpell)[]): SpellData[] {
  return spells.map(spell => {
    return convertToSpellData(spell);
  });
}

/**
 * Вычисляет максимальный уровень заклинаний для класса и уровня персонажа
 * @param characterClass класс персонажа
 * @param characterLevel уровень персонажа
 * @returns максимальный уровень заклинаний
 */
export function getMaxSpellLevel(characterClass: string, characterLevel: number): number {
  // Полные заклинатели (жрец, волшебник, друид...)
  const fullCasters = ['жрец', 'волшебник', 'друид', 'бард', 'чародей', 'cleric', 'wizard', 'druid', 'bard', 'sorcerer'];
  // Половинные заклинатели (паладин, следопыт...)
  const halfCasters = ['паладин', 'следопыт', 'paladin', 'ranger'];
  
  const lowerClass = characterClass.toLowerCase();
  
  // Для полных заклинателей
  if (fullCasters.some(c => lowerClass.includes(c))) {
    if (characterLevel >= 17) return 9;
    if (characterLevel >= 15) return 8;
    if (characterLevel >= 13) return 7;
    if (characterLevel >= 11) return 6;
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    return characterLevel >= 1 ? 1 : 0;
  }
  
  // Для половинных заклинателей
  if (halfCasters.some(c => lowerClass.includes(c))) {
    if (characterLevel >= 17) return 5;
    if (characterLevel >= 13) return 4;
    if (characterLevel >= 9) return 3;
    if (characterLevel >= 5) return 2;
    return characterLevel >= 2 ? 1 : 0;
  }
  
  // Колдун (warlock) имеет особую систему
  if (lowerClass.includes('колдун') || lowerClass.includes('warlock')) {
    if (characterLevel >= 17) return 9;
    if (characterLevel >= 15) return 8;
    if (characterLevel >= 13) return 7;
    if (characterLevel >= 11) return 6;
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    return characterLevel >= 1 ? 1 : 0;
  }
  
  // Для остальных классов
  return 0;
}

/**
 * Вычисляет доступные заклинания по классу и уровню
 * @param characterClass класс персонажа
 * @param characterLevel уровень персонажа
 * @param abilityModifier модификатор основной характеристики
 * @returns объект с информацией о доступных заклинаниях
 */
export function calculateAvailableSpellsByClassAndLevel(
  characterClass: string,
  characterLevel: number,
  abilityModifier: number = 0
): { 
  maxSpellLevel: number; 
  cantripsCount: number; 
  knownSpells: number;
  preparedSpells?: number;
} {
  const lowerClass = characterClass.toLowerCase();
  let result = {
    maxSpellLevel: getMaxSpellLevel(characterClass, characterLevel),
    cantripsCount: 0,
    knownSpells: 0,
    preparedSpells: undefined as number | undefined
  };
  
  // Жрец (Cleric)
  if (lowerClass.includes('жрец') || lowerClass.includes('cleric')) {
    result.cantripsCount = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
    result.preparedSpells = characterLevel + abilityModifier;
  }
  
  // Друид (Druid)
  else if (lowerClass.includes('друид') || lowerClass.includes('druid')) {
    result.cantripsCount = characterLevel >= 4 ? 3 : 2;
    result.preparedSpells = characterLevel + abilityModifier;
  }
  
  // Бард (Bard)
  else if (lowerClass.includes('бард') || lowerClass.includes('bard')) {
    result.cantripsCount = characterLevel >= 10 ? 4 : 2;
    result.knownSpells = Math.max(4, 4 + Math.floor((characterLevel - 1) / 2) * 2);
  }
  
  // Волшебник (Wizard)
  else if (lowerClass.includes('волшебник') || lowerClass.includes('wizard')) {
    result.cantripsCount = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
    result.preparedSpells = characterLevel + abilityModifier;
  }
  
  // Чародей (Sorcerer)
  else if (lowerClass.includes('чародей') || lowerClass.includes('sorcerer')) {
    result.cantripsCount = characterLevel >= 10 ? 6 : characterLevel >= 4 ? 5 : 4;
    result.knownSpells = characterLevel + 1;
  }
  
  // Колдун (Warlock)
  else if (lowerClass.includes('колдун') || lowerClass.includes('warlock')) {
    result.cantripsCount = characterLevel >= 10 ? 4 : 2;
    result.knownSpells = Math.max(2, 1 + Math.ceil(characterLevel / 2));
  }
  
  // Паладин (Paladin)
  else if (lowerClass.includes('паладин') || lowerClass.includes('paladin')) {
    result.preparedSpells = Math.floor(characterLevel / 2) + abilityModifier;
  }
  
  // Следопыт (Ranger)
  else if (lowerClass.includes('следопыт') || lowerClass.includes('ranger')) {
    result.knownSpells = Math.max(0, Math.floor(characterLevel / 2) + 1);
  }
  
  return result;
}
