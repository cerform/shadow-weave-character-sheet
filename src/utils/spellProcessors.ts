
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Разбирает строку компонентов заклинания и возвращает булевы значения для каждого типа компонента
 */
export function parseComponents(componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} {
  // Приводим строку к верхнему регистру для упрощения проверки
  const upperString = componentString.toUpperCase();
  
  return {
    verbal: upperString.includes('В') || upperString.includes('V'),
    somatic: upperString.includes('С') || upperString.includes('S'),
    material: upperString.includes('М') || upperString.includes('M'),
    ritual: upperString.includes('Р') || upperString.includes('R'),
    concentration: upperString.includes('К') || upperString.includes('C')
  };
}

/**
 * Создает уникальный ключ для заклинания
 */
export function createSpellKey(spell: SpellData | CharacterSpell): string;
export function createSpellKey(name: string, level: number): string;
export function createSpellKey(spellOrName: SpellData | CharacterSpell | string, level?: number): string {
  if (typeof spellOrName === 'string') {
    return `${spellOrName.toLowerCase().trim()}-${level}`;
  }
  return `${spellOrName.name.toLowerCase().trim()}-${spellOrName.level}`;
}

/**
 * Проверяет, является ли заклинание дубликатом существующего
 */
export function isDuplicateSpell(spell: SpellData | CharacterSpell, existingSpells: Array<SpellData | CharacterSpell>): boolean {
  const key = createSpellKey(spell);
  return existingSpells.some(existing => createSpellKey(existing) === key);
}

/**
 * Удаляет дубликаты заклинаний из массива
 */
export function removeDuplicateSpells<T extends SpellData | CharacterSpell>(spells: T[]): T[] {
  const uniqueSpells = new Map<string, T>();
  
  spells.forEach(spell => {
    const key = createSpellKey(spell);
    // Если заклинания еще нет в карте или текущее заклинание имеет больше заполненных полей
    if (!uniqueSpells.has(key) || 
        Object.keys(spell).filter(k => Boolean(spell[k as keyof T])).length > 
        Object.keys(uniqueSpells.get(key)!).filter(k => Boolean(uniqueSpells.get(key)![k as keyof T])).length) {
      uniqueSpells.set(key, spell);
    }
  });
  
  return Array.from(uniqueSpells.values());
}
