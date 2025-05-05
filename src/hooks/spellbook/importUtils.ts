
import { CharacterSpell } from '@/types/character';
import { parseComponents } from '@/utils/spellProcessors';
import { SpellData } from './types';

/**
 * Парсит запись заклинания из текстового формата
 * Формат: [уровень] название компоненты
 * Пример: [3] Молния ВСМ
 */
export function parseSpellEntry(entry: string): {
  name: string;
  level: number;
  components: string;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} | null {
  // Соответствие шаблону [3] Название ВСМ
  const match = entry.match(/\[(\d+)\]\s+(.+?)\s+([\wКВСМР\.]*)$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = match[3] || '';
  
  const { verbal, somatic, material, ritual, concentration } = parseComponents(componentCode);
  
  return {
    name,
    level,
    components: componentCode,
    verbal,
    somatic,
    material,
    ritual,
    concentration
  };
}

/**
 * Обрабатывает блок текста с заклинаниями
 */
export function processSpellBatch(text: string): Array<{
  name: string;
  level: number;
  components: string;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
}> {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const results = [];
  
  for (const line of lines) {
    const parsed = parseSpellEntry(line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
}

/**
 * Импортирует заклинания из текста в существующий список
 */
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const parsedSpells = processSpellBatch(text);
  const updatedSpells = [...existingSpells];
  
  // Создаем объект для быстрого поиска
  const existingSpellsMap = new Map<string, number>();
  existingSpells.forEach((spell, index) => {
    const key = `${spell.name}-${spell.level}`;
    existingSpellsMap.set(key, index);
  });
  
  parsedSpells.forEach(parsed => {
    const key = `${parsed.name}-${parsed.level}`;
    const existingIndex = existingSpellsMap.get(key);
    
    if (existingIndex !== undefined) {
      // Обновляем существующее заклинание
      updatedSpells[existingIndex] = {
        ...updatedSpells[existingIndex],
        components: parsed.components,
        verbal: parsed.verbal,
        somatic: parsed.somatic,
        material: parsed.material,
        ritual: parsed.ritual,
        concentration: parsed.concentration
      };
    } else {
      // Добавляем новое заклинание с базовыми параметрами
      const newSpell: CharacterSpell = {
        name: parsed.name,
        level: parsed.level,
        school: "Прорицание", // Школа по умолчанию
        castingTime: "1 действие",
        range: "На себя",
        components: parsed.components,
        duration: parsed.concentration ? "Концентрация, вплоть до 1 минуты" : "Мгновенная",
        description: "Нет описания",
        classes: ["Волшебник"], // Класс по умолчанию
        verbal: parsed.verbal,
        somatic: parsed.somatic,
        material: parsed.material,
        ritual: parsed.ritual,
        concentration: parsed.concentration,
        prepared: false // Обязательное поле prepared
      };
      
      updatedSpells.push(newSpell);
    }
  });
  
  return updatedSpells;
}

/**
 * Импорт заклинаний из подробного формата (как в учебнике)
 * @param text Текст с детальным описанием заклинаний
 */
export function importSpellsFromDetailedText(text: string): SpellData[] {
  const spells: SpellData[] = [];
  
  // Разделяем текст на блоки заклинаний (каждое заклинание начинается с названия и заканчивается перед следующим)
  const blocks = text.split(/\n(?=\S)/); // Разделяем по переносу строки, за которым следует не пробел
  
  let currentId = 1000; // Начинаем с ID 1000, чтобы не конфликтовать с существующими
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    
    if (block.length < 10) continue; // Пропускаем слишком короткие блоки
    
    // Регулярные выражения для извлечения информации
    const nameMatch = block.match(/^(.+?)(?:\n|$)/);
    const levelMatch = block.match(/(?:^|\n)(Заговор|\d+-й уровень)/i);
    const schoolMatch = block.match(/(?:^|\n)(?:Заговор|\d+-й уровень)\n(.+?)(?:\n|$)/i);
    const concentrationMatch = block.match(/Концентрация/i);
    const castingTimeMatch = block.match(/Время накладывания: (.+?)(?:\n|$)/i);
    const rangeMatch = block.match(/Дистанция: (.+?)(?:\n|$)/i);
    const componentsMatch = block.match(/Компоненты: (.+?)(?:\n|$)/i);
    const durationMatch = block.match(/Длительность: (.+?)(?:\n|$)/i);
    const classesMatch = block.match(/Классы: (.+?)(?:\n|$)/i);
    
    if (!nameMatch) continue;
    
    const name = nameMatch[1].trim();
    let level = 0;
    
    if (levelMatch) {
      const levelText = levelMatch[1].toLowerCase();
      if (levelText === 'заговор') {
        level = 0;
      } else {
        const digitMatch = levelText.match(/(\d+)/);
        if (digitMatch) {
          level = parseInt(digitMatch[1], 10);
        }
      }
    }
    
    // Компоненты
    let verbal = false;
    let somatic = false;
    let material = false;
    let components = '';
    
    if (componentsMatch) {
      components = componentsMatch[1];
      verbal = components.includes('В');
      somatic = components.includes('С');
      material = components.includes('М');
    }
    
    // Классы
    let classes: string[] = [];
    if (classesMatch) {
      classes = classesMatch[1].split(',').map(c => c.trim());
    }
    
    // Создаем объект заклинания
    const spell: SpellData = {
      id: (currentId++).toString(),
      name,
      level,
      school: schoolMatch ? schoolMatch[1].trim() : 'Воплощение',
      castingTime: castingTimeMatch ? castingTimeMatch[1].trim() : '1 действие',
      range: rangeMatch ? rangeMatch[1].trim() : '60 футов',
      components,
      verbal,
      somatic,
      material,
      duration: durationMatch ? durationMatch[1].trim() : 'Мгновенная',
      concentration: !!concentrationMatch,
      ritual: false, // По умолчанию не ритуал
      classes,
      prepared: false, // Устанавливаем prepared значение по умолчанию
    };
    
    spells.push(spell);
  }
  
  return spells;
}
