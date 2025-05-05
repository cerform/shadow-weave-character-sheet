
import { CharacterSpell } from '@/types/character';

/**
 * Функция для добавления поля prepared ко всем заклинаниям
 */
export const ensureSpellFields = <T extends Partial<CharacterSpell>[]>(spells: T): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false,
  })) as CharacterSpell[];
};

/**
 * Функция для обертывания массива заклинаний с добавлением поля prepared
 */
export const wrapWithPrepared = <T extends Record<string, any>[]>(spells: T): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    prepared: false,
    id: spell.id || undefined // Сохраняем id, если он есть
  })) as CharacterSpell[];
};
