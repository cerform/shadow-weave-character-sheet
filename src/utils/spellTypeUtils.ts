
import { Character, CharacterSpell } from '@/types/character';

/**
 * Преобразует смешанный массив строк или CharacterSpell в массив CharacterSpell
 */
export function normalizeCharacterSpells(spells: (string | CharacterSpell)[] | undefined): CharacterSpell[] {
  if (!spells) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // Значение по умолчанию
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`
      };
    }
    return spell;
  });
}

/**
 * Обновляет список заклинаний персонажа, обеспечивая совместимость типов
 */
export function updateCharacterSpells(
  character: Character, 
  newSpells: CharacterSpell[]
): Partial<Character> {
  return {
    spells: newSpells as CharacterSpell[]
  };
}

/**
 * Конвертирует строковое представление оборудования в объекты Item
 */
export function normalizeEquipment(equipment: string[] | Item[] | undefined): Item[] {
  if (!equipment) return [];
  
  return equipment.map(item => {
    if (typeof item === 'string') {
      return {
        name: item,
        quantity: 1
      };
    }
    return item;
  });
}
