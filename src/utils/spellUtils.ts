
import { Character, CharacterSpell } from '@/types/character';
import { safeGet } from './safetyUtils';

/**
 * Тип SpellData для компонента отображения заклинаний
 */
export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  source?: string;
  classes?: string[];
}

/**
 * Преобразует список заклинаний персонажа в нормализованный формат
 */
export function normalizeSpells(character: Character): CharacterSpell[] {
  if (!character.spells || !Array.isArray(character.spells)) {
    return [];
  }

  return character.spells.map(spell => {
    // Если заклинание - строка, преобразуем его в объект минимального формата
    if (typeof spell === 'string') {
      return {
        id: spell,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: 'Действие',
        range: '60 футов',
        components: 'В',
        duration: 'Мгновенная',
        description: 'Нет подробного описания'
      };
    }

    // Если заклинание уже в виде объекта, возвращаем как есть
    return {
      ...spell,
      id: spell.id || spell.name,
    };
  });
}

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export function canPrepareMoreSpells(character?: Character): boolean {
  if (!character || !needsPreparation(character)) return true;

  const preparedLimit = getPreparedSpellsLimit(character);
  const preparedCount = character.spells
    ? character.spells.filter(spell => 
        typeof spell !== 'string' && spell.prepared && spell.level > 0
      ).length
    : 0;

  return preparedCount < preparedLimit;
}

/**
 * Проверяет, должен ли класс персонажа готовить заклинания
 */
export function needsPreparation(character?: Character): boolean {
  if (!character || !character.class) return false;

  const preparingClasses = [
    'жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 
    'паладин', 'paladin', 'следопыт', 'ranger', 'изобретатель', 'artificer'
  ];

  return preparingClasses.includes(character.class.toLowerCase());
}

/**
 * Определяет лимит подготовленных заклинаний для персонажа
 */
export function getPreparedSpellsLimit(character?: Character): number {
  if (!character) return 0;

  // Получаем модификатор базовой характеристики для заклинаний
  const spellcastingAbility = getSpellcastingAbility(character);
  let abilityScore = 0;

  if (spellcastingAbility) {
    abilityScore = safeGet(character, `stats.${spellcastingAbility}`, 10);
  }

  const abilityMod = Math.floor((abilityScore - 10) / 2);
  const characterLevel = character.level || 1;

  // Вычисляем лимит по формуле: модификатор + уровень
  return Math.max(1, abilityMod + characterLevel);
}

/**
 * Определяет базовую характеристику для заклинаний в зависимости от класса
 */
export function getSpellcastingAbility(character?: Character): string {
  if (!character || !character.class) return 'intelligence';

  const characterClass = character.class.toLowerCase();
  
  if (['бард', 'bard', 'чародей', 'sorcerer', 'колдун', 'warlock'].includes(characterClass)) {
    return 'charisma';
  } else if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(characterClass)) {
    return 'wisdom';
  } else {
    return 'intelligence'; // Волшебник, Мистический рыцарь, Плут (Ловкач), Изобретатель
  }
}

/**
 * Преобразует CharacterSpell в SpellData
 */
export function convertToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id || spell.name,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || 'Действие',
    range: spell.range || '60 футов',
    components: spell.components || 'В',
    duration: spell.duration || 'Мгновенная',
    description: Array.isArray(spell.description) ? spell.description.join('\n') : (spell.description || ''),
    prepared: spell.prepared,
    ritual: spell.ritual,
    concentration: spell.concentration,
    source: spell.source,
    classes: Array.isArray(spell.classes) ? spell.classes : spell.classes ? [spell.classes] : []
  };
}

