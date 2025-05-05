
import { CharacterSpell } from '@/types/character';

/**
 * Преобразует объект заклинания в строку (например, для сохранения в базе данных)
 */
export const characterSpellToString = (spell: CharacterSpell): string => {
  return spell.name;
};

/**
 * Преобразует строку или объект в объект CharacterSpell
 */
export const stringToCharacterSpell = (spell: string | CharacterSpell): CharacterSpell => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0, // Уровень по умолчанию
      school: 'Неизвестная',
      castingTime: '1 действие',
      range: 'На себя',
      components: '',
      duration: 'Мгновенная',
      description: 'Нет описания',
      prepared: false
    };
  }
  
  return {
    ...spell,
    prepared: spell.prepared ?? false
  };
};

/**
 * Проверяет, является ли заклинание заговором
 */
export const isCantrip = (spell: CharacterSpell | { level: number }): boolean => {
  return spell.level === 0;
};

/**
 * Обновляет статус подготовки заклинания
 */
export const toggleSpellPrepared = (spell: CharacterSpell): CharacterSpell => {
  return {
    ...spell,
    prepared: !spell.prepared
  };
};
