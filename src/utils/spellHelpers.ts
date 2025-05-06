
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Конвертирует массив CharacterSpell в массив SpellData
 */
export const convertCharacterSpellsToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};

/**
 * Преобразует строковое представление компонентов в отдельные флаги
 * @param components Строка с компонентами (например "ВСМ")
 */
export const parseSpellComponents = (components: string) => {
  if (!components) return { verbal: false, somatic: false, material: false };
  
  return {
    verbal: components.includes('В'),
    somatic: components.includes('С'),
    material: components.includes('М'),
  };
};

/**
 * Форматирует классы заклинаний для отображения
 */
export const formatSpellClasses = (classes: string[] | string): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

/**
 * Проверяет, является ли заклинание объектом типа CharacterSpell
 */
export const isCharacterSpellObject = (spell: any): spell is CharacterSpell => {
  return typeof spell === 'object' && 'name' in spell && 'level' in spell;
};

/**
 * Проверяет, подготовлено ли заклинание
 */
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') return false;
  return !!spell.prepared;
};

/**
 * Получает уровень заклинания
 */
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') return 0; // По умолчанию заговор
  return spell.level;
};

/**
 * Преобразует CharacterSpell к SpellData
 */
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || ['Нет описания'],
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};

/**
 * Получает название уровня заклинания (для отображения)
 */
export const getSpellLevelName = (level: number): string => {
  if (level === 0) return "Заговор";
  if (level === 1) return "1-й уровень";
  if (level === 2) return "2-й уровень";
  if (level === 3) return "3-й уровень";
  if (level >= 4) return `${level}-й уровень`;
  return `${level} уровень`;
};
