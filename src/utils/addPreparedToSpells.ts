
import { CharacterSpell } from '@/types/character';

/**
 * Функция для добавления поля prepared ко всем заклинаниям
 * @param spells Массив заклинаний
 * @returns Массив заклинаний с полем prepared
 */
export const addPreparedToAllSpells = <T extends Partial<CharacterSpell>[]>(spells: T): CharacterSpell[] => {
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
