
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Проверка, является ли объект заклинания типом CharacterSpell
export const isCharacterSpellObject = (spell: string | CharacterSpell): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

// Получение имени заклинания независимо от типа
export const getSpellName = (spell: string | CharacterSpell): string => {
  return typeof spell === 'string' ? spell : spell.name;
};

// Получение уровня заклинания независимо от типа
export const getSpellLevel = (spell: string | CharacterSpell): number => {
  return typeof spell === 'string' ? 0 : spell.level || 0;
};

// Проверка, подготовлено ли заклинание
export const isSpellPrepared = (spell: string | CharacterSpell): boolean => {
  return typeof spell !== 'string' && !!spell.prepared;
};

// Конвертация CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (spell: string | CharacterSpell): SpellData => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0,
      school: "Неизвестная",
      castingTime: "1 действие",
      range: "Неизвестная",
      components: "",
      duration: "Мгновенная",
      description: ""
    };
  }
  
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school || "Неизвестная",
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "Неизвестная",
    components: spell.components || "",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "",
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    higherLevels: spell.higherLevels,
    prepared: spell.prepared
  };
};

// Конвертация массива заклинаний в формат SpellData
export const convertSpellArray = (spells: (string | CharacterSpell)[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};
