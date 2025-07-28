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

    // Подготавливаем данные для обновления (без id)
    const { id, ...characterData } = prepareCharacterForDB(character, user.id);

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
 * Подготавливает объект персонажа для сохранения в БД
 */
function prepareCharacterForDB(character: Character, userId: string): any {
  return {
    user_id: userId,
    name: character.name || '',
    race: character.race || '',
    subrace: character.subrace || null,
    class: character.class || '',
    subclass: character.subclass || null,
    level: character.level || 1,
    experience: character.experience || 0,
    
    // Основные характеристики
    strength: character.strength || 10,
    dexterity: character.dexterity || 10,
    constitution: character.constitution || 10,
    intelligence: character.intelligence || 10,
    wisdom: character.wisdom || 10,
    charisma: character.charisma || 10,
    
    // Здоровье и защита
    max_hp: character.maxHp || 8,
    current_hp: character.currentHp || 8,
    armor_class: character.armorClass || 10,
    speed: character.speed || 30,
    proficiency_bonus: character.proficiencyBonus || 2,
    
    // JSON поля
    spells: character.spells || [],
    equipment: character.equipment || [],
    money: character.money || { gp: 0, sp: 0, cp: 0 },
    stats: character.stats || {},
    hit_points: character.hitPoints || { current: 8, maximum: 8, temporary: 0 },
    proficiencies: character.proficiencies || [],
    
    // Текстовые поля
    background: character.background || null,
    backstory: character.backstory || null,
    alignment: character.alignment || null,
    gender: character.gender || null
  };
}

/**
 * Конвертирует данные из БД в объект Character
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
    level: dbData.level,
    experience: dbData.experience,
    
    // Основные характеристики
    strength: dbData.strength,
    dexterity: dbData.dexterity,
    constitution: dbData.constitution,
    intelligence: dbData.intelligence,
    wisdom: dbData.wisdom,
    charisma: dbData.charisma,
    
    // Здоровье и защита
    maxHp: dbData.max_hp,
    currentHp: dbData.current_hp,
    armorClass: dbData.armor_class,
    speed: dbData.speed,
    proficiencyBonus: dbData.proficiency_bonus,
    
    // JSON поля
    spells: dbData.spells || [],
    equipment: dbData.equipment || [],
    money: dbData.money || { gp: 0, sp: 0, cp: 0 },
    stats: dbData.stats || {
      strength: dbData.strength,
      dexterity: dbData.dexterity,
      constitution: dbData.constitution,
      intelligence: dbData.intelligence,
      wisdom: dbData.wisdom,
      charisma: dbData.charisma
    },
    hitPoints: dbData.hit_points || { current: dbData.current_hp, maximum: dbData.max_hp, temporary: 0 },
    proficiencies: dbData.proficiencies || [],
    
    // Текстовые поля
    background: dbData.background,
    backstory: dbData.backstory,
    alignment: dbData.alignment,
    gender: dbData.gender,
    
    // Метаданные
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  };
}