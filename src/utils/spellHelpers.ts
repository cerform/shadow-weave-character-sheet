
import { SpellData, CharacterSpell } from "@/types/spells";

// Нормализует массив заклинаний в единый формат
export const normalizeSpells = (spells: any[] | null | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells) || spells.length === 0) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, создаем минимальный объект
      return {
        name: spell,
        level: 0, // Уровень неизвестен
      };
    } else {
      // Нормализуем объект заклинания
      return {
        id: spell.id || undefined,
        name: spell.name || "Неизвестное заклинание",
        level: typeof spell.level === 'number' ? spell.level : 0,
        school: spell.school || undefined,
        castingTime: spell.castingTime || undefined,
        range: spell.range || undefined,
        components: spell.components || undefined,
        duration: spell.duration || undefined,
        description: spell.description || undefined,
        classes: Array.isArray(spell.classes) ? spell.classes : [],
        ritual: Boolean(spell.ritual),
        concentration: Boolean(spell.concentration),
        verbal: Boolean(spell.verbal),
        somatic: Boolean(spell.somatic),
        material: Boolean(spell.material),
        prepared: Boolean(spell.prepared),
        materials: spell.materials || undefined,
        higherLevel: spell.higherLevel || spell.higherLevels || undefined,
        higherLevels: spell.higherLevels || spell.higherLevel || undefined,
        source: spell.source || undefined
      };
    }
  });
};

// Возвращает отображаемое название уровня заклинания
export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0:
      return "Заговор";
    case 1:
      return "1-й уровень";
    case 2:
      return "2-й уровень";
    case 3:
      return "3-й уровень";
    case 4:
      return "4-й уровень";
    case 5:
      return "5-й уровень";
    case 6:
      return "6-й уровень";
    case 7:
      return "7-й уровень";
    case 8:
      return "8-й уровень";
    case 9:
      return "9-й уровень";
    default:
      return `${level}-й уровень`;
  }
};

// Группирует заклинания по уровням
export const groupSpellsByLevel = (spells: CharacterSpell[]): Record<number, CharacterSpell[]> => {
  const grouped: Record<number, CharacterSpell[]> = {};
  
  spells.forEach(spell => {
    const level = spell.level || 0;
    if (!grouped[level]) {
      grouped[level] = [];
    }
    grouped[level].push(spell);
  });
  
  // Сортируем заклинания по имени внутри каждого уровня
  Object.keys(grouped).forEach(levelStr => {
    const level = Number(levelStr);
    grouped[level].sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '');
    });
  });
  
  return grouped;
};

// Фильтрует заклинания по подготовленным
export const getPreparedSpells = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.filter(spell => spell.prepared);
};

// Получает ключевую характеристику для заклинаний на основе класса
export const getSpellcastingAbility = (characterClass: string): string => {
  // Привести к нижнему регистру для облегчения сравнения
  const className = characterClass.toLowerCase();
  
  if (
    className === 'волшебник' || 
    className === 'wizard' || 
    className === 'artificer' || 
    className === 'изобретатель'
  ) {
    return 'intelligence';
  } else if (
    className === 'жрец' || 
    className === 'cleric' || 
    className === 'друид' || 
    className === 'druid' || 
    className === 'ranger' || 
    className === 'следопыт'
  ) {
    return 'wisdom';
  } else if (
    className === 'бард' || 
    className === 'bard' || 
    className === 'warlock' || 
    className === 'колдун' || 
    className === 'чародей' || 
    className === 'sorcerer' || 
    className === 'paladin' || 
    className === 'паладин'
  ) {
    return 'charisma';
  }
  
  return 'intelligence'; // По умолчанию
};
