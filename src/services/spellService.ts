import { supabase } from '@/integrations/supabase/client';
import { CharacterSpell } from '@/types/character';

/**
 * Saves a spell to the character's spellbook in Supabase
 * @param characterId ID of the character
 * @param spell Spell to add/update
 * @returns Promise with success status
 */
export async function saveCharacterSpell(characterId: string, spell: CharacterSpell): Promise<boolean> {
  try {
    // 1. Get current spells
    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('spells')
      .eq('id', characterId)
      .single();

    if (fetchError) throw fetchError;

    const currentSpells = (character?.spells as CharacterSpell[]) || [];
    
    // 2. Update or Add
    const existingIndex = currentSpells.findIndex(s => s.name === spell.name);
    let newSpells;
    if (existingIndex >= 0) {
      newSpells = [...currentSpells];
      newSpells[existingIndex] = { ...spell };
    } else {
      newSpells = [...currentSpells, { ...spell }];
    }

    // 3. Save back
    const { error: saveError } = await supabase
      .from('characters')
      .update({ spells: newSpells as any })
      .eq('id', characterId);

    if (saveError) throw saveError;
    return true;
  } catch (error) {
    console.error('[SpellService] Error saving spell:', error);
    return false;
  }
}

/**
 * Legacy wrapper for custom spells (now strictly returns empty or loads from a designated character)
 */
export async function getAllSpellsFromDatabase(): Promise<CharacterSpell[]> {
  console.warn('[SpellService] getAllSpellsFromDatabase is deprecated. Use character-specific spell loading.');
  return [];
}

/**
 * Deletes a spell from the character's spellbook
 */
export async function deleteCharacterSpell(characterId: string, spellName: string): Promise<boolean> {
  try {
    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('spells')
      .eq('id', characterId)
      .single();

    if (fetchError) throw fetchError;

    const currentSpells = (character?.spells as CharacterSpell[]) || [];
    const newSpells = currentSpells.filter(s => s.name !== spellName);

    const { error: saveError } = await supabase
      .from('characters')
      .update({ spells: newSpells as any })
      .eq('id', characterId);

    if (saveError) throw saveError;
    return true;
  } catch (error) {
    console.error('[SpellService] Error deleting spell:', error);
    return false;
  }
}
