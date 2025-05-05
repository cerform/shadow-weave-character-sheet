// Экспортируем функцию для разбора компонентов заклинания
export const parseComponents = (componentStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration?: boolean;
} => {
  return {
    verbal: componentStr.includes('В'),
    somatic: componentStr.includes('С'),
    material: componentStr.includes('М'),
    ritual: componentStr.includes('Р'),
    concentration: componentStr.includes('К')
  };
};

// Функция для расчета доступных заклинаний по классу и уровню
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string | undefined,
  level: number,
  abilities?: {
    wisdom?: number;
    charisma?: number;
    intelligence?: number;
  }
): { 
  spells: number; 
  cantrips: number;
  maxSpellLevel: number;
} => {
  if (!characterClass) return { spells: 0, cantrips: 0, maxSpellLevel: 0 };
  
  const abilityModifier = (abilityScore?: number): number => {
    if (!abilityScore) return 0;
    return Math.floor((abilityScore - 10) / 2);
  };

  const wisdomMod = abilityModifier(abilities?.wisdom);
  const charismaMod = abilityModifier(abilities?.charisma);
  const intelligenceMod = abilityModifier(abilities?.intelligence);

  let spellsCount = 0;
  let cantripsCount = 0;
  let maxSpellLevel = 0;

  switch (characterClass) {
    case "Бард":
      // Бард: 2 заговора на 1 уровне, +1 на 10-м уровне
      cantripsCount = level >= 10 ? 3 : 2;
      
      // Известные заклинания для барда
      const bardSpellsByLevel = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
      spellsCount = bardSpellsByLevel[Math.min(level, 20)];
      
      // Максимальный уровень заклинаний
      if (level >= 17) maxSpellLevel = 9;
      else if (level >= 15) maxSpellLevel = 8;
      else if (level >= 13) maxSpellLevel = 7;
      else if (level >= 11) maxSpellLevel = 6;
      else if (level >= 9) maxSpellLevel = 5;
      else if (level >= 7) maxSpellLevel = 4;
      else if (level >= 5) maxSpellLevel = 3;
      else if (level >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
      break;
      
    case "Жрец":
      // Заговоры для жреца
      if (level >= 10) cantripsCount = 5;
      else if (level >= 4) cantripsCount = 4;
      else cantripsCount = 3;
      
      // Жрецы готовят заклинания: уровень + модификатор мудрости
      spellsCount = level + Math.max(0, wisdomMod);
      
      // Максимальный уровень заклинаний
      if (level >= 17) maxSpellLevel = 9;
      else if (level >= 15) maxSpellLevel = 8;
      else if (level >= 13) maxSpellLevel = 7;
      else if (level >= 11) maxSpellLevel = 6;
      else if (level >= 9) maxSpellLevel = 5;
      else if (level >= 7) maxSpellLevel = 4;
      else if (level >= 5) maxSpellLevel = 3;
      else if (level >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
      break;
      
    case "Друид":
      // Заговоры для друида
      if (level >= 10) cantripsCount = 4;
      else if (level >= 4) cantripsCount = 3;
      else cantripsCount = 2;
      
      // Друиды готовят заклинания: уровень + модификатор мудрости
      spellsCount = level + Math.max(0, wisdomMod);
      
      // Максимальный уровень заклинаний
      if (level >= 17) maxSpellLevel = 9;
      else if (level >= 15) maxSpellLevel = 8;
      else if (level >= 13) maxSpellLevel = 7;
      else if (level >= 11) maxSpellLevel = 6;
      else if (level >= 9) maxSpellLevel = 5;
      else if (level >= 7) maxSpellLevel = 4;
      else if (level >= 5) maxSpellLevel = 3;
      else if (level >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
      break;
      
    case "Волшебник":
      // Заговоры для волшебника
      if (level >= 10) cantripsCount = 5;
      else if (level >= 4) cantripsCount = 4;
      else cantripsCount = 3;
      
      // Волшебники записывают в книгу заклинаний: 6 + 2 за каждый уровень
      spellsCount = 6 + (level - 1) * 2;
      
      // Максимальный уровень заклинаний
      if (level >= 17) maxSpellLevel = 9;
      else if (level >= 15) maxSpellLevel = 8;
      else if (level >= 13) maxSpellLevel = 7;
      else if (level >= 11) maxSpellLevel = 6;
      else if (level >= 9) maxSpellLevel = 5;
      else if (level >= 7) maxSpellLevel = 4;
      else if (level >= 5) maxSpellLevel = 3;
      else if (level >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
      break;
      
    case "Чародей":
      // Заговоры для чародея
      if (level >= 10) cantripsCount = 6;
      else if (level >= 4) cantripsCount = 5;
      else cantripsCount = 4;
      
      // Известные заклинания для чародея
      const sorcererSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
      spellsCount = sorcererSpellsByLevel[Math.min(level, 20)];
      
      // Максимальный уровень заклинаний
      if (level >= 17) maxSpellLevel = 9;
      else if (level >= 15) maxSpellLevel = 8;
      else if (level >= 13) maxSpellLevel = 7;
      else if (level >= 11) maxSpellLevel = 6;
      else if (level >= 9) maxSpellLevel = 5;
      else if (level >= 7) maxSpellLevel = 4;
      else if (level >= 5) maxSpellLevel = 3;
      else if (level >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
      break;
      
    case "Колдун":
      // Заговоры для колдуна
      if (level >= 10) cantripsCount = 4;
      else if (level >= 4) cantripsCount = 3;
      else cantripsCount = 2;
      
      // Известные заклинания для колдуна
      const warlockSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
      spellsCount = warlockSpellsByLevel[Math.min(level, 20)];
      
      // Максимальный уровень заклинаний
      if (level >= 17) maxSpellLevel = 9;
      else if (level >= 15) maxSpellLevel = 8;
      else if (level >= 13) maxSpellLevel = 7;
      else if (level >= 11) maxSpellLevel = 5;
      else if (level >= 9) maxSpellLevel = 5;
      else if (level >= 7) maxSpellLevel = 4;
      else if (level >= 5) maxSpellLevel = 3;
      else if (level >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
      break;
      
    case "Паладин":
      // Паладины не получают заговоры
      cantripsCount = 0;
      
      // Паладины получают заклинания со 2-го уровня
      if (level < 2) {
        spellsCount = 0;
        maxSpellLevel = 0;
      } else {
        // Паладины готовят заклинания: половина уровня + модификатор Харизмы (минимум 1)
        spellsCount = Math.max(1, Math.floor(level / 2) + Math.max(0, charismaMod));
        
        // Максимальный уровень заклинаний
        if (level >= 17) maxSpellLevel = 5;
        else if (level >= 13) maxSpellLevel = 4;
        else if (level >= 9) maxSpellLevel = 3;
        else if (level >= 5) maxSpellLevel = 2;
        else maxSpellLevel = 1;
      }
      break;
      
    case "Следопыт":
      // Следопыты не получают заговоры
      cantripsCount = 0;
      
      // Следопыты получают заклинания со 2-го уровня
      if (level < 2) {
        spellsCount = 0;
        maxSpellLevel = 0;
      } else {
        // Следопыты готовят заклинания: половина уровня + модификатор Мудрости (минимум 1)
        spellsCount = Math.max(1, Math.floor(level / 2) + Math.max(0, wisdomMod));
        
        // Максимальный уровень заклинаний
        if (level >= 17) maxSpellLevel = 5;
        else if (level >= 13) maxSpellLevel = 4;
        else if (level >= 9) maxSpellLevel = 3;
        else if (level >= 5) maxSpellLevel = 2;
        else maxSpellLevel = 1;
      }
      break;
      
    default:
      spellsCount = 0;
      cantripsCount = 0;
      maxSpellLevel = 0;
  }
  
  return { spells: spellsCount, cantrips: cantripsCount, maxSpellLevel };
};

// Импортируем необходимые типы
import { CharacterSpell } from '@/types/character';

// Экспортируем функцию для обработки пакетного ввода заклинаний
export interface SpellBatchItem {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
    concentration?: boolean;
  };
}

export const processSpellBatch = (rawText: string): SpellBatchItem[] => {
  const lines = rawText.split('\n').filter(line => line.trim().length > 0);
  const result: SpellBatchItem[] = [];
  
  for (const line of lines) {
    const match = line.match(/\[(\d+)\]\s+(.+?)\s+([\w\.]*)$/);
    
    if (match) {
      const level = parseInt(match[1], 10);
      const name = match[2].trim();
      const componentCode = match[3] || '';
      
      result.push({
        name,
        level,
        components: parseComponents(componentCode)
      });
    }
  }
  
  return result;
};

// Функция для импорта заклинаний из текста
export const importSpellsFromText = (
  rawText: string,
  existingSpells: CharacterSpell[]
): CharacterSpell[] => {
  const batchItems = processSpellBatch(rawText);
  const result = [...existingSpells];
  
  batchItems.forEach(item => {
    // Проверяем, существует ли уже заклинание с таким именем
    const existingIndex = result.findIndex(spell => spell.name === item.name);
    
    if (existingIndex === -1) {
      // Добавляем новое заклинание
      result.push({
        id: `spell_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        level: item.level,
        school: 'Неизвестная', // Можно заменить на более точное определение
        castingTime: '1 действие',
        range: 'На себя',
        components: `${item.components.verbal ? 'В' : ''}${item.components.somatic ? 'С' : ''}${item.components.material ? 'М' : ''}`,
        duration: 'Мгновенная',
        description: 'Описание отсутствует',
        prepared: false,
        verbal: item.components.verbal,
        somatic: item.components.somatic,
        material: item.components.material,
        ritual: item.components.ritual,
        concentration: item.components.concentration || false,
        classes: []
      });
    }
  });
  
  return result;
};
