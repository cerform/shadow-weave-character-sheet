import { supabase } from '@/integrations/supabase/client';
import { Character } from '@/types/character';

/**
 * Сервис для работы с персонажами через Supabase
 */

// Создание нового персонажа
export const saveCharacter = async (character: Character): Promise<Character> => {
  try {
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    // Подготавливаем данные для сохранения
    const characterData = prepareCharacterForDB(character, user.id);

    console.log('💾 Сохраняем персонажа в Supabase:', characterData);

    const { data, error } = await supabase
      .from('characters')
      .insert([characterData])
      .select()
      .single();

    if (error) {
      console.error('❌ Ошибка при сохранении персонажа:', error);
      throw error;
    }

    console.log('✅ Персонаж успешно сохранен:', data);
    return convertFromDB(data);
  } catch (error) {
    console.error('❌ Ошибка в saveCharacter:', error);
    throw error;
  }
};

// Обновление существующего персонажа
export const updateCharacter = async (character: Character): Promise<void> => {
  try {
    if (!character.id) {
      throw new Error('У персонажа отсутствует ID');
    }

    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    // Prepare update payload — prepareCharacterForDB does not include id
    const characterData = prepareCharacterForDB(character, user.id);

    console.log('🔄 Обновляем персонажа в Supabase:', characterData);

    const { error } = await supabase
      .from('characters')
      .update(characterData)
      .eq('id', character.id);

    if (error) {
      console.error('❌ Ошибка при обновлении персонажа:', error);
      throw error;
    }

    console.log('✅ Персонаж успешно обновлен');
  } catch (error) {
    console.error('❌ Ошибка в updateCharacter:', error);
    throw error;
  }
};

// Удаление персонажа
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Ошибка при удалении персонажа:', error);
      throw error;
    }

    console.log('✅ Персонаж успешно удален');
  } catch (error) {
    console.error('❌ Ошибка в deleteCharacter:', error);
    throw error;
  }
};

// Получение всех персонажей пользователя
export const getUserCharacters = async (): Promise<Character[]> => {
  try {
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    console.log('📥 Загружаем персонажей пользователя:', user.id);

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Ошибка при загрузке персонажей:', error);
      throw error;
    }

    console.log('✅ Загружено персонажей:', data?.length || 0);
    return data?.map(convertFromDB) || [];
  } catch (error) {
    console.error('❌ Ошибка в getUserCharacters:', error);
    throw error;
  }
};

// Получение персонажа по ID
export const getCharacterById = async (id: string): Promise<Character | null> => {
  try {
    console.log('📥 Загружаем персонажа по ID:', id);

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Персонаж не найден
        console.log('⚠️ Персонаж не найден');
        return null;
      }
      console.error('❌ Ошибка при загрузке персонажа:', error);
      throw error;
    }

    console.log('✅ Персонаж загружен:', data.name);
    return convertFromDB(data);
  } catch (error) {
    console.error('❌ Ошибка в getCharacterById:', error);
    throw error;
  }
};

/**
 * Prepares a Character object for Supabase INSERT/UPDATE.
 * Maps all Character interface fields to snake_case DB columns.
 * All JSON fields are stored as JSONB.
 */
function prepareCharacterForDB(character: Character, userId: string) {
  // Sanitize spells — fix objects stored as {_type: "undefined"} from upstream bug
  const rawSpells = (character.spells || []) as any[];
  const cleanSpells = rawSpells.map((spell: any) => {
    const s: any = { ...spell };
    if (s.verbal && typeof s.verbal === 'object') {
      s.verbal = s.components?.includes('V') || s.components?.includes('В') || false;
    }
    if (s.somatic && typeof s.somatic === 'object') {
      s.somatic = s.components?.includes('S') || s.components?.includes('С') || false;
    }
    if (s.material && typeof s.material === 'object') {
      s.material = s.components?.includes('M') || s.components?.includes('М') || false;
    }
    // Strip undefined values before JSON serialization
    return Object.fromEntries(
      Object.entries(s).filter(([, v]) => v !== undefined)
    );
  });

  return {
    user_id: userId,

    // ── Core identity ────────────────────────────────────────────────────────
    name: character.name || '',
    race: character.race || null,
    subrace: character.subrace || null,
    class: character.class || null,
    subclass: character.subclass || null,
    background: character.background || null,
    alignment: character.alignment || null,
    gender: character.gender || null,
    level: character.level || 1,
    experience: character.experience || 0,

    // ── Ability scores (flat columns) ────────────────────────────────────────
    strength: character.strength ?? character.stats?.strength ?? character.abilities?.strength ?? 10,
    dexterity: character.dexterity ?? character.stats?.dexterity ?? character.abilities?.dexterity ?? 10,
    constitution: character.constitution ?? character.stats?.constitution ?? character.abilities?.constitution ?? 10,
    intelligence: character.intelligence ?? character.stats?.intelligence ?? character.abilities?.intelligence ?? 10,
    wisdom: character.wisdom ?? character.stats?.wisdom ?? character.abilities?.wisdom ?? 10,
    charisma: character.charisma ?? character.stats?.charisma ?? character.abilities?.charisma ?? 10,

    // ── Derived stats ─────────────────────────────────────────────────────────
    max_hp: character.maxHp ?? character.hitPoints?.maximum ?? 8,
    current_hp: character.currentHp ?? character.hitPoints?.current ?? 8,
    temp_hp: character.tempHp ?? character.temporaryHp ?? character.hitPoints?.temporary ?? 0,
    armor_class: character.armorClass ?? 10,
    speed: character.speed ?? 30,
    proficiency_bonus: character.proficiencyBonus ?? 2,
    initiative: typeof character.initiative === 'number' ? character.initiative : null,

    // ── JSONB fields ──────────────────────────────────────────────────────────
    stats: character.stats ?? null,
    hit_points: character.hitPoints ?? null,
    spells: cleanSpells,
    spell_slots: character.spellSlots ?? null,
    equipment: character.equipment ?? [],
    money: character.money ?? { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 },
    proficiencies: character.proficiencies ?? null,
    skills: character.skills ?? null,
    saving_throws: character.savingThrows ?? null,
    features: character.features ?? null,
    feats: character.feats ?? null,
    race_features: character.raceFeatures ?? null,
    class_features: character.classFeatures ?? null,
    background_features: character.backgroundFeatures ?? null,
    resources: character.resources ?? null,
    sorcery_points: character.sorceryPoints ?? null,
    hit_dice: character.hitDice ?? null,
    death_saves: character.deathSaves ?? null,

    // ── Text / narrative fields ───────────────────────────────────────────────
    backstory: character.backstory ?? null,
    appearance: character.appearance ?? null,
    personality_traits: character.personalityTraits ?? null,
    ideals: character.ideals ?? null,
    bonds: character.bonds ?? null,
    flaws: character.flaws ?? null,
    notes: character.notes ?? null,
    image: character.image ?? null,
  };
}

/**
 * Converts a raw Supabase DB row into a typed Character object.
 * Maps all snake_case columns back to camelCase Character fields.
 */
function convertFromDB(dbData: any): Character {
  return {
    id: dbData.id,
    userId: dbData.user_id,
    name: dbData.name,
    race: dbData.race,
    subrace: dbData.subrace,
    class: dbData.class,
    subclass: dbData.subclass,
    background: dbData.background,
    alignment: dbData.alignment,
    gender: dbData.gender,
    level: dbData.level,
    experience: dbData.experience,

    // Ability scores
    strength: dbData.strength,
    dexterity: dbData.dexterity,
    constitution: dbData.constitution,
    intelligence: dbData.intelligence,
    wisdom: dbData.wisdom,
    charisma: dbData.charisma,

    // Derived
    maxHp: dbData.max_hp,
    currentHp: dbData.current_hp,
    tempHp: dbData.temp_hp ?? 0,
    temporaryHp: dbData.temp_hp ?? 0,
    armorClass: dbData.armor_class,
    speed: dbData.speed,
    proficiencyBonus: dbData.proficiency_bonus,
    initiative: dbData.initiative ?? undefined,

    // Rebuild stats object from flat columns if not stored separately
    stats: dbData.stats ?? {
      strength: dbData.strength,
      dexterity: dbData.dexterity,
      constitution: dbData.constitution,
      intelligence: dbData.intelligence,
      wisdom: dbData.wisdom,
      charisma: dbData.charisma,
    },

    // HP object
    hitPoints: dbData.hit_points ?? {
      current: dbData.current_hp,
      maximum: dbData.max_hp,
      temporary: dbData.temp_hp ?? 0,
    },

    // JSONB fields
    spells: dbData.spells ?? [],
    spellSlots: dbData.spell_slots ?? undefined,
    equipment: dbData.equipment ?? [],
    money: dbData.money ?? { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 },
    proficiencies: dbData.proficiencies ?? undefined,
    skills: dbData.skills ?? undefined,
    savingThrows: dbData.saving_throws ?? undefined,
    features: dbData.features ?? undefined,
    feats: dbData.feats ?? undefined,
    raceFeatures: dbData.race_features ?? undefined,
    classFeatures: dbData.class_features ?? undefined,
    backgroundFeatures: dbData.background_features ?? undefined,
    resources: dbData.resources ?? undefined,
    sorceryPoints: dbData.sorcery_points ?? undefined,
    hitDice: dbData.hit_dice ?? undefined,
    deathSaves: dbData.death_saves ?? undefined,

    // Text / narrative
    backstory: dbData.backstory,
    appearance: dbData.appearance,
    personalityTraits: dbData.personality_traits,
    ideals: dbData.ideals,
    bonds: dbData.bonds,
    flaws: dbData.flaws,
    notes: dbData.notes,
    image: dbData.image,

    // Timestamps
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
}