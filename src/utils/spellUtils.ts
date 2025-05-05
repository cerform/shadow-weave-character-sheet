
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Нормализация массива заклинаний
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, преобразуем его в объект
      return {
        name: spell,
        level: 0 // По умолчанию считаем заговором
      };
    } else if (typeof spell === 'object') {
      // Если заклинание уже является объектом, возвращаем его как есть
      return spell;
    } else {
      // Этого случая быть не должно, но на всякий случай
      return {
        name: String(spell),
        level: 0
      };
    }
  });
};

// Преобразование CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная', // Добавляем значение по умолчанию
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || '60 футов',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    prepared: spell.prepared || false
  };
};

// Функция для определения, является ли заклинание заговором или заклинанием определённого уровня
export const getSpellLevel = (spell: any): number => {
  if (typeof spell === 'object' && spell !== null) {
    return spell.level || 0;
  }
  return 0; // По умолчанию считаем заговором
};

// Проверка, подготовлено ли заклинание
export const isSpellPrepared = (spell: any): boolean => {
  if (typeof spell === 'object' && spell !== null) {
    return !!spell.prepared;
  }
  return false; // По умолчанию заклинание не подготовлено
};

// Проверка, является ли значение объектом CharacterSpell
export const isCharacterSpellObject = (spell: any): spell is CharacterSpell => {
  return typeof spell === 'object' && spell !== null && 'name' in spell;
};
