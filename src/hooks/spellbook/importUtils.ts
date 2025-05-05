
import { CharacterSpell, SpellData } from '@/types/character';

// Функция для разбора строки заклинания
export const parseSpellString = (spellText: string): Partial<CharacterSpell> => {
  // Базовый формат: [уровень] название компоненты
  const levelRegex = /\[(\d+)\]/;
  const levelMatch = spellText.match(levelRegex);
  
  // Получаем уровень заклинания
  const level = levelMatch ? parseInt(levelMatch[1]) : 0;
  
  // Удаляем метку уровня из текста и очищаем от лишних пробелов
  let name = levelMatch 
    ? spellText.replace(levelRegex, '').trim() 
    : spellText.trim();
  
  // Проверяем, есть ли в строке компоненты (В, С, М)
  const componentsRegex = /\b([ВСМ]+)\b/;
  const componentsMatch = name.match(componentsRegex);
  
  // Определяем компоненты заклинания
  const verbal = componentsMatch ? componentsMatch[1].includes('В') : false;
  const somatic = componentsMatch ? componentsMatch[1].includes('С') : false;
  const material = componentsMatch ? componentsMatch[1].includes('М') : false;
  
  // Удаляем компоненты из имени заклинания
  if (componentsMatch) {
    name = name.replace(componentsRegex, '').trim();
  }
  
  // Возвращаем объект с данными заклинания
  return {
    name,
    level,
    verbal,
    somatic,
    material,
    prepared: false, // По умолчанию заклинание не подготовлено
    school: "Универсальная" // Устанавливаем школу по умолчанию
  };
};

// Функция для импорта заклинаний из текста
export const importSpellsFromText = (text: string): CharacterSpell[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  // Разбиваем текст на строки
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Преобразуем каждую строку в объект заклинания
  const importedSpells: CharacterSpell[] = lines.map(line => {
    const spellData = parseSpellString(line);
    return {
      name: spellData.name || "Неизвестное заклинание",
      level: spellData.level || 0,
      prepared: false,
      verbal: spellData.verbal || false,
      somatic: spellData.somatic || false,
      material: spellData.material || false,
      school: spellData.school || "Универсальная",
    } as CharacterSpell;
  });
  
  return importedSpells;
};

// Функция для обновления существующих заклинаний и добавления новых
export function updateSpellList(
  existingSpells: CharacterSpell[],
  newSpellsData: CharacterSpell[]
): CharacterSpell[] {
  const updatedSpells = [...existingSpells];
  
  // Перебираем новые заклинания
  newSpellsData.forEach((newSpell) => {
    // Ищем совпадение по имени
    const existingIndex = updatedSpells.findIndex(
      (spell) => spell.name.toLowerCase() === newSpell.name.toLowerCase()
    );
    
    // Если заклинание уже существует, обновляем его
    if (existingIndex !== -1) {
      updatedSpells[existingIndex] = {
        ...updatedSpells[existingIndex],
        ...newSpell,
      };
    } else {
      // Иначе добавляем новое заклинание
      updatedSpells.push(newSpell);
    }
  });
  
  return updatedSpells;
}
