
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

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
