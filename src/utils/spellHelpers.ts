
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Нормализация заклинаний из смешанного формата (строки и объекты) в объекты CharacterSpell
export const normalizeSpells = (spells: (string | CharacterSpell)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // По умолчанию считаем заговором
        prepared: false
      };
    }
    return spell;
  });
};

// Конвертация CharacterSpell в SpellData
export const convertToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => ({
    id: spell.id?.toString() || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    source: spell.source || "Player's Handbook"
  }));
};

// Получение названия уровня заклинания
export const getSpellLevelName = (level: number): string => {
  const levelNames: Record<number, string> = {
    0: 'Заговор',
    1: '1-й уровень',
    2: '2-й уровень',
    3: '3-й уровень',
    4: '4-й уровень',
    5: '5-й уровень',
    6: '6-й уровень',
    7: '7-й уровень',
    8: '8-й уровень',
    9: '9-й уровень'
  };
  return levelNames[level] || `Уровень ${level}`;
};

// Группировка заклинаний по уровню
export const groupSpellsByLevel = (spells: CharacterSpell[]): Record<number, CharacterSpell[]> => {
  return spells.reduce((acc: Record<number, CharacterSpell[]>, spell) => {
    const level = spell.level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});
};

// Получение подготовленных заклинаний
export const getPreparedSpells = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.filter(spell => spell.prepared);
};

// Получение заклинательной характеристики персонажа
export const getSpellcastingAbility = (characterClass: string): string => {
  const classLower = characterClass.toLowerCase();
  
  if (['жрец', 'друид', 'cleric', 'druid', 'ranger', 'следопыт'].includes(classLower)) {
    return 'wisdom';
  } else if (['волшебник', 'wizard', 'artificer'].includes(classLower)) {
    return 'intelligence';
  } else {
    // bard, sorcerer, warlock, paladin
    return 'charisma';
  }
};

// Проверка, можно ли подготовить еще заклинания
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const preparedSpells = character.spells.filter(spell => {
    if (typeof spell === 'string') return false; // строки считаем заговорами, они всегда подготовлены
    return spell.prepared && spell.level > 0; // проверяем только заклинания не-заговоры
  });
  
  const limit = getPreparedSpellsLimit(character);
  return preparedSpells.length < limit;
};

// Получение лимита подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.class || !character.level) return 0;
  
  const classLower = character.class.toLowerCase();
  let modifier = 0;
  
  // Получаем модификатор заклинательной характеристики
  const ability = getSpellcastingAbility(classLower);
  if (ability === 'wisdom' && character.abilities?.wisdom) {
    modifier = Math.floor((character.abilities.wisdom - 10) / 2);
  } else if (ability === 'intelligence' && character.abilities?.intelligence) {
    modifier = Math.floor((character.abilities.intelligence - 10) / 2);
  } else if (ability === 'charisma' && character.abilities?.charisma) {
    modifier = Math.floor((character.abilities.charisma - 10) / 2);
  }
  
  // Для классов, которые готовят заклинания (жрец, друид, волшебник, паладин)
  if (['жрец', 'друид', 'cleric', 'druid', 'волшебник', 'wizard', 'палладин', 'paladin'].includes(classLower)) {
    return character.level + modifier;
  }
  
  // Для классов, которые не готовят заклинания (бард, колдун, чародей)
  return 0;
};

// Получение уровня заклинания (для объектов и строк)
export const getSpellLevel = (spell: string | CharacterSpell): number => {
  if (typeof spell === 'string') {
    return 0; // По умолчанию считаем заговором
  }
  return spell.level || 0;
};

// Проверка, подготовлено ли заклинание
export const isSpellPrepared = (spell: string | CharacterSpell): boolean => {
  if (typeof spell === 'string') {
    return true; // Заговоры всегда "подготовлены"
  }
  // Если это заговор, он всегда "подготовлен"
  if (spell.level === 0) return true;
  
  return !!spell.prepared;
};

// Проверка, является ли объект заклинания объектом, а не строкой
export const isCharacterSpellObject = (spell: string | CharacterSpell): spell is CharacterSpell => {
  return typeof spell !== 'string';
};
