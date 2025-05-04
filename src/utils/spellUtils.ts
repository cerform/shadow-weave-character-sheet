
import { CharacterSpell } from "@/types/character";

// Функция для безопасного объединения строк или массивов строк
export const safeJoin = (input: string[] | string | undefined, separator: string = ", "): string => {
  if (!input) return "";
  if (Array.isArray(input)) return input.join(separator);
  return input;
};

// Функция для конвертации строк заклинаний в объекты CharacterSpell
export const normalizeSpells = (spells: string[] | CharacterSpell[]): CharacterSpell[] => {
  if (!spells || spells.length === 0) return [];
  
  // Проверяем, является ли первый элемент строкой
  if (typeof spells[0] === 'string') {
    // Конвертируем строки в заготовки объектов CharacterSpell
    return (spells as string[]).map(spellName => ({
      name: spellName,
      level: 0, // По умолчанию
      school: "Неизвестно", // По умолчанию
      description: "Нет описания",
      verbal: false,
      somatic: false,
      material: false,
      prepared: false,
    }));
  }
  
  // Уже в формате CharacterSpell
  return spells as CharacterSpell[];
};

// Функция для получения строки с уровнем заклинания
export const getSpellLevelText = (level: number): string => {
  if (level === 0) return "Заговор";
  return `${level} уровень`;
};
