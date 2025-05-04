
import { CharacterSpell } from '@/types/character';

// Функция для импорта заклинаний из текстового формата
export function importSpellsFromText(
  rawText: string, 
  existingSpells: CharacterSpell[] = []
): CharacterSpell[] {
  try {
    // Разбиваем текст по двойным новым строкам (обычно разделяют заклинания)
    const spellBlocks = rawText.split('\n\n').filter(block => block.trim().length > 0);
    
    // Анализируем каждый блок
    const importedSpells: CharacterSpell[] = spellBlocks.map(block => {
      const lines = block.split('\n');
      
      // Предполагаем, что первая строка - имя заклинания
      const name = lines[0]?.trim() || 'Unknown Spell';
      
      // Остальные поля попробуем найти в тексте
      let level = 0;
      let school = 'Универсальная';
      let castingTime = '1 действие';
      let range = '30 футов';
      let components = 'В, С, М';
      let duration = 'Мгновенная';
      let description = '';
      let higherLevels = '';
      
      // Ищем шаблоны текста для выделения различных свойств заклинания
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('уровень') || trimmedLine.includes('уровня') || trimmedLine.includes('Заговор')) {
          // Определяем уровень заклинания
          if (trimmedLine.includes('Заговор')) {
            level = 0;
          } else {
            const levelMatch = trimmedLine.match(/(\d+)/);
            if (levelMatch) level = parseInt(levelMatch[1]);
          }
          
          // Определяем школу из той же строки
          ['Воплощение', 'Вызов', 'Ограждение', 'Прорицание', 'Некромантия', 
           'Преобразование', 'Очарование', 'Иллюзия', 'Универсальная'].forEach(s => {
            if (trimmedLine.includes(s)) school = s;
          });
        }
        
        // Ищем время накладывания
        if (trimmedLine.includes('Время накладывания:')) {
          castingTime = trimmedLine.replace('Время накладывания:', '').trim();
        }
        
        // Ищем дальность
        if (trimmedLine.includes('Дальность:')) {
          range = trimmedLine.replace('Дальность:', '').trim();
        }
        
        // Ищем компоненты
        if (trimmedLine.includes('Компоненты:')) {
          components = trimmedLine.replace('Компоненты:', '').trim();
        }
        
        // Ищем длительность
        if (trimmedLine.includes('Длительность:')) {
          duration = trimmedLine.replace('Длительность:', '').trim();
        }
        
        // Если строка не содержит перечисленные выше маркеры,
        // добавляем её к описанию заклинания
        if (!trimmedLine.includes(':') && trimmedLine.length > 0 && 
            !trimmedLine.includes('уровень') && !trimmedLine.includes('уровня') &&
            !trimmedLine.includes('Заговор')) {
          description += trimmedLine + ' ';
        }
        
        // Ищем описание повышения уровня
        if (trimmedLine.includes('На более высоких уровнях:')) {
          higherLevels = trimmedLine.replace('На более высоких уровнях:', '').trim() + ' ';
        }
      });
      
      // Определяем концентрацию и ритуал из поля длительности
      const concentration = duration.includes('Концентрация');
      const ritual = components.includes('ритуал');
      
      // Определяем компоненты
      const verbal = components.includes('В');
      const somatic = components.includes('С');
      const material = components.includes('М');
      
      // Создаем новое заклинание
      const newSpell: CharacterSpell = {
        name,
        level,
        school,
        castingTime,
        range,
        components,
        duration,
        description: description.trim(),
        higherLevels: higherLevels.trim(),
        concentration,
        ritual,
        verbal,
        somatic,
        material,
        prepared: false, // Обязательное поле для CharacterSpell
        // Предполагаем классы (для точности требуется дополнительный анализ)
        classes: []
      };
      
      return newSpell;
    });
    
    // Объединяем импортированные заклинания с существующими, исключая дубликаты
    const combinedSpells = [...existingSpells];
    importedSpells.forEach(newSpell => {
      if (!combinedSpells.some(s => s.name === newSpell.name)) {
        combinedSpells.push(newSpell);
      }
    });
    
    return combinedSpells;
  } catch (error) {
    console.error('Error importing spells from text:', error);
    return existingSpells;
  }
}

// Добавляем функцию processSpellBatch
export function processSpellBatch(rawText: string): any[] {
  try {
    // Разбиваем текст по строкам
    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    
    // Анализируем каждую строку
    return lines.map(line => {
      // Регулярное выражение для поиска уровня заклинания [число]
      const levelMatch = line.match(/\[(\d+)\]/);
      const level = levelMatch ? parseInt(levelMatch[1]) : 0;
      
      // Извлекаем имя заклинания - всё после [число] до компонентов
      let name = line.replace(/\[\d+\]/, '').trim();
      
      // Проверяем наличие компонентов в конце строки (обычно буквы В, С, М)
      const componentsMatch = name.match(/\s([ВСМ]+|[VSM]+)$/i);
      let components = {
        verbal: false,
        somatic: false,
        material: false,
        ritual: false,
        concentration: false
      };
      
      if (componentsMatch) {
        const componentStr = componentsMatch[1];
        name = name.replace(componentsMatch[0], '').trim();
        
        // Определяем компоненты
        components.verbal = /[ВV]/i.test(componentStr);
        components.somatic = /[СS]/i.test(componentStr);
        components.material = /[МM]/i.test(componentStr);
        // Проверяем дополнительные метки
        components.ritual = /[Р]/i.test(componentStr);
        components.concentration = /[К]/i.test(componentStr);
      }
      
      return {
        name,
        level,
        components
      };
    });
  } catch (error) {
    console.error("Ошибка при обработке заклинаний:", error);
    return [];
  }
}

// Создадим функцию для конвертации заклинания в правильный формат с полем prepared
export const convertToCharacterSpell = (spell: any): CharacterSpell => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    higherLevels: spell.higherLevels,
    concentration: spell.concentration,
    ritual: spell.ritual,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    classes: spell.classes,
    prepared: false // Добавляем обязательное поле prepared
  };
};
