
import { CharacterSpell } from '@/types/character';
import { spells as allSpells, getSpellsByClass, getSpellsByLevel, getSpellDetails, getAllSpells } from '@/data/spells/index';

// Экспортируем все функции для совместимости
export { spells, getAllSpells, getSpellsByClass, getSpellsByLevel, getSpellDetails } from '@/data/spells/index';

// Вспомогательная функция для обеспечения поля prepared в любом массиве заклинаний
export const ensureSpellsHavePrepared = (spells: Partial<CharacterSpell>[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false,
    level: spell.level !== undefined ? spell.level : 0,
    school: spell.school || "Универсальная",
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "На себя",
    components: spell.components || "",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "Нет описания"
  } as CharacterSpell));
};

// Функция для преобразования любого объекта в CharacterSpell
export const convertToCharacterSpell = (obj: any): CharacterSpell => {
  return {
    name: obj.name || "Неизвестное заклинание",
    level: typeof obj.level === 'number' ? obj.level : 0,
    school: obj.school || "Универсальная",
    castingTime: obj.castingTime || "1 действие",
    range: obj.range || "На себя",
    components: obj.components || "",
    duration: obj.duration || "Мгновенная",
    description: obj.description || "Нет описания",
    prepared: obj.prepared !== undefined ? obj.prepared : false,
    verbal: obj.verbal !== undefined ? obj.verbal : false,
    somatic: obj.somatic !== undefined ? obj.somatic : false,
    material: obj.material !== undefined ? obj.material : false
  };
};
