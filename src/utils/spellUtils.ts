
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

// Функция для конвертации CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    // Если передана строка, возвращаем базовую структуру SpellData
    return {
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Нет описания',
      classes: [], // Добавляем пустой массив для classes
    };
  }
  
  // Используем функцию из types/spells.ts для конвертации
  return convertCharacterSpellToSpellData(spell);
};

// Функция для нормализации массива заклинаний
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0,
        // Минимальные поля для CharacterSpell
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: 'В, С',
        duration: 'Мгновенная',
        description: 'Нет описания',
        classes: []
      };
    }
    return spell;
  });
};
