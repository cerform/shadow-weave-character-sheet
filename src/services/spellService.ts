import { SpellData } from '@/types/spells';

const CUSTOM_SPELLS_KEY = 'shadow_weave_custom_spells';

/**
 * Сохраняет заклинание в базу данных (локально для пользовательских)
 * @param spell Заклинание для сохранения
 * @param userId ID пользователя (опционально)
 * @returns Promise с ID сохраненного заклинания
 */
export async function saveSpellToDatabase(spell: SpellData, userId?: string | null): Promise<string> {
  const id = spell.id?.toString() || `spell-${Date.now()}`;
  
  try {
    const customSpells = JSON.parse(localStorage.getItem(CUSTOM_SPELLS_KEY) || '[]');
    
    const existingIndex = customSpells.findIndex((s: SpellData) => s.id === spell.id);
    if (existingIndex >= 0) {
      customSpells[existingIndex] = { ...spell, id };
    } else {
      customSpells.push({ ...spell, id });
    }
    
    localStorage.setItem(CUSTOM_SPELLS_KEY, JSON.stringify(customSpells));
  } catch (error) {
    console.error('Error saving spell:', error);
  }
  
  return id;
}

/**
 * Получает все кастомные заклинания
 * @returns Promise с массивом заклинаний
 */
export async function getAllSpellsFromDatabase(): Promise<SpellData[]> {
  try {
    const customSpells = JSON.parse(localStorage.getItem(CUSTOM_SPELLS_KEY) || '[]');
    return customSpells;
  } catch (error) {
    console.error('Error loading custom spells:', error);
    return [];
  }
}

/**
 * Удаляет заклинание из базы данных
 * @param spellId ID заклинания для удаления
 * @returns Promise с результатом операции
 */
export async function deleteSpellFromDatabase(spellId: string): Promise<boolean> {
  try {
    let customSpells = JSON.parse(localStorage.getItem(CUSTOM_SPELLS_KEY) || '[]');
    customSpells = customSpells.filter((s: SpellData) => s.id !== spellId);
    localStorage.setItem(CUSTOM_SPELLS_KEY, JSON.stringify(customSpells));
    return true;
  } catch (error) {
    console.error('Error deleting spell:', error);
    return false;
  }
}
