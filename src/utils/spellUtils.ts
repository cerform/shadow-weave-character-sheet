
import { Character, CharacterSpell, SpellData } from '@/types/character';

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
    result[spell.id] = { ...spell };
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
    id: spell.id,
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
