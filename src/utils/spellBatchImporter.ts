
import { CharacterSpell } from '@/types/character';

// Функция для парсинга текстовых данных заклинаний
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  if (!text || text.trim() === '') {
    return existingSpells;
  }

  try {
    // Попробуем сначала парсить как JSON
    try {
      const parsedData = JSON.parse(text);
      if (Array.isArray(parsedData)) {
        // Проверяем, что это массив заклинаний
        const validSpells = parsedData.filter(spell => 
          typeof spell === 'object' && 
          spell !== null && 
          'name' in spell && 
          'level' in spell
        );
        
        // Объединяем с существующими заклинаниями и удаляем дубликаты
        return mergeAndDedupeSpells([...existingSpells, ...validSpells]);
      }
    } catch (e) {
      // Если не JSON, продолжаем с другими форматами
      console.log('Не удалось распарсить как JSON, пробуем другие форматы');
    }
    
    // Парсим структурированный текстовый формат
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const spells: CharacterSpell[] = [];
    
    let currentSpell: Partial<CharacterSpell> | null = null;
    let descriptionBuffer: string[] = [];
    
    lines.forEach(line => {
      // Начало нового заклинания (обычно содержит название и уровень/школу)
      if (line.match(/^([A-Za-zА-Яа-я\s]+)(?:\s*\(|\s+—|\s+-)/i)) {
        // Сохраняем предыдущее заклинание, если оно было
        if (currentSpell?.name && currentSpell?.level !== undefined) {
          if (descriptionBuffer.length > 0) {
            currentSpell.description = descriptionBuffer.join('\n');
          }
          spells.push(currentSpell as CharacterSpell);
        }
        
        // Начинаем новое заклинание
        currentSpell = { name: '', level: 0 };
        descriptionBuffer = [];
        
        // Извлекаем название заклинания
        const nameMatch = line.match(/^([A-Za-zА-Яа-я\s]+)/);
        if (nameMatch) {
          currentSpell.name = nameMatch[1].trim();
        }
        
        // Пытаемся определить уровень
        const levelMatch = line.match(/(\d+)-й уровень|уровень (\d+)|заговор|cantrip/i);
        if (levelMatch) {
          currentSpell.level = levelMatch[1] ? parseInt(levelMatch[1], 10) : 
                              (levelMatch[2] ? parseInt(levelMatch[2], 10) : 0);
        } else if (line.toLowerCase().includes('заговор') || line.toLowerCase().includes('cantrip')) {
          currentSpell.level = 0;
        }
        
        // Определяем школу магии
        const schools = ['вызов', 'ограждение', 'прорицание', 'очарование', 'преобразование', 'некромантия', 'иллюзия', 'воплощение',
                        'conjuration', 'abjuration', 'divination', 'enchantment', 'transmutation', 'necromancy', 'illusion', 'evocation'];
        
        for (const school of schools) {
          if (line.toLowerCase().includes(school)) {
            currentSpell.school = school;
            break;
          }
        }
      }
      // Время накладывания
      else if (line.match(/^Время накладывания:|^Casting Time:/i)) {
        if (currentSpell) {
          currentSpell.castingTime = line.split(':')[1]?.trim();
        }
      }
      // Дистанция
      else if (line.match(/^Дистанция:|^Range:/i)) {
        if (currentSpell) {
          currentSpell.range = line.split(':')[1]?.trim();
        }
      }
      // Компоненты
      else if (line.match(/^Компоненты:|^Components:/i)) {
        if (currentSpell) {
          const comps = line.split(':')[1]?.trim();
          currentSpell.components = comps;
          
          // Анализируем компоненты
          currentSpell.verbal = comps?.includes('В') || comps?.includes('V') || false;
          currentSpell.somatic = comps?.includes('С') || comps?.includes('S') || false;
          currentSpell.material = (comps?.includes('М') || comps?.includes('M')) || false;
          
          // Извлекаем материалы
          const materialMatch = comps?.match(/\((.*?)\)/);
          if (materialMatch) {
            currentSpell.materials = materialMatch[1].trim();
          }
        }
      }
      // Длительность
      else if (line.match(/^Длительность:|^Duration:/i)) {
        if (currentSpell) {
          const duration = line.split(':')[1]?.trim();
          currentSpell.duration = duration;
          currentSpell.concentration = duration?.toLowerCase().includes('концентрация') || 
                                     duration?.toLowerCase().includes('concentration') || 
                                     false;
        }
      }
      // Классы
      else if (line.match(/^Классы:|^Classes:/i)) {
        if (currentSpell) {
          const classesStr = line.split(':')[1]?.trim();
          if (classesStr) {
            currentSpell.classes = classesStr.split(',').map(c => c.trim());
          }
        }
      }
      // Если ничего не совпало, считаем строку частью описания
      else {
        descriptionBuffer.push(line);
      }
    });
    
    // Добавляем последнее заклинание, если оно было
    if (currentSpell?.name && currentSpell?.level !== undefined) {
      if (descriptionBuffer.length > 0) {
        currentSpell.description = descriptionBuffer.join('\n');
      }
      spells.push(currentSpell as CharacterSpell);
    }
    
    // Объединяем с существующими заклинаниями и удаляем дубликаты
    return mergeAndDedupeSpells([...existingSpells, ...spells]);
  } catch (error) {
    console.error('Ошибка при импорте заклинаний из текста:', error);
    return existingSpells;
  }
}

// Функция для объединения списков заклинаний и удаления дубликатов
function mergeAndDedupeSpells(spells: CharacterSpell[]): CharacterSpell[] {
  const uniqueSpells = new Map<string, CharacterSpell>();
  
  spells.forEach(spell => {
    if (spell && spell.name) {
      const key = spell.name.toLowerCase();
      
      // Если заклинание уже существует, обогащаем его данными из нового
      if (uniqueSpells.has(key)) {
        const existingSpell = uniqueSpells.get(key)!;
        uniqueSpells.set(key, { ...existingSpell, ...spell });
      } else {
        uniqueSpells.set(key, { ...spell });
      }
    }
  });
  
  return Array.from(uniqueSpells.values());
}
