
import { SpellData } from '@/types/spells';

/**
 * Парсит текст заклинания в структуру SpellData
 * @param text Текст заклинания для парсинга
 * @returns Объект SpellData или null, если парсинг не удался
 */
export function parseSpell(text: string): SpellData | null {
  // Базовая реализация парсера заклинаний
  try {
    // Попробуем распарсить как JSON сначала
    try {
      const jsonData = JSON.parse(text);
      
      if (jsonData && typeof jsonData === 'object' && jsonData.name) {
        return {
          id: jsonData.id || `spell-${jsonData.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: jsonData.name,
          level: jsonData.level || 0,
          school: jsonData.school || 'Универсальная',
          castingTime: jsonData.castingTime || '1 действие',
          range: jsonData.range || 'Касание',
          components: jsonData.components || '',
          duration: jsonData.duration || 'Мгновенная',
          description: jsonData.description || '',
          classes: jsonData.classes || [],
          ritual: jsonData.ritual || false,
          concentration: jsonData.concentration || false,
          verbal: jsonData.verbal || false,
          somatic: jsonData.somatic || false,
          material: jsonData.material || false
        };
      }
    } catch (e) {
      // Не JSON, продолжаем с текстовым парсингом
    }

    // Простой парсер для текстового формата
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 3) {
      return null;
    }
    
    // Первая строка обычно содержит название и уровень
    const nameMatch = lines[0].match(/(.+)(?:\s+\((\d+)-й уровень\)|\s+\(заговор\))/i);
    if (!nameMatch) return null;
    
    const name = nameMatch[1].trim();
    const level = nameMatch[2] ? parseInt(nameMatch[2], 10) : 0;
    
    // Определяем школу магии (обычно во второй строке)
    const schoolLine = lines.find(line => /школа|воплощени|преобразовани|некромант|прорицани|очарован|иллюзи|вызов|ограждени/i.test(line));
    let school = 'Универсальная';
    
    if (schoolLine) {
      if (/ограждени|защит/i.test(schoolLine)) school = 'Ограждение';
      else if (/вызов|призыв/i.test(schoolLine)) school = 'Вызов';
      else if (/прорицани/i.test(schoolLine)) school = 'Прорицание';
      else if (/очарован/i.test(schoolLine)) school = 'Очарование';
      else if (/некромант/i.test(schoolLine)) school = 'Некромантия';
      else if (/преобразован|трансмутац/i.test(schoolLine)) school = 'Преобразование';
      else if (/иллюзи/i.test(schoolLine)) school = 'Иллюзия';
      else if (/воплощени/i.test(schoolLine)) school = 'Воплощение';
    }
    
    // Ищем время накладывания
    const castingTimeLine = lines.find(line => /время накладыван|врем[\s\S]{0,10}накладыван/i.test(line));
    let castingTime = '1 действие';
    if (castingTimeLine) {
      const castingTimeMatch = castingTimeLine.match(/врем[\s\S]{0,10}накладыван[^:]*:\s*(.*)/i);
      if (castingTimeMatch) castingTime = castingTimeMatch[1].trim();
    }
    
    // Ищем дистанцию
    const rangeLine = lines.find(line => /дистанц|дальност/i.test(line));
    let range = 'На себя';
    if (rangeLine) {
      const rangeMatch = rangeLine.match(/дистанц[^:]*:\s*(.*)/i) || rangeLine.match(/дальност[^:]*:\s*(.*)/i);
      if (rangeMatch) range = rangeMatch[1].trim();
    }
    
    // Ищем компоненты
    const componentsLine = lines.find(line => /компонент/i.test(line));
    let components = '';
    let verbal = false;
    let somatic = false;
    let material = false;
    let materials = '';
    
    if (componentsLine) {
      const componentsMatch = componentsLine.match(/компонент[^:]*:\s*(.*)/i);
      if (componentsMatch) {
        components = componentsMatch[1].trim();
        verbal = /В/i.test(components);
        somatic = /С/i.test(components);
        material = /М/i.test(components);
        
        // Если есть материальные компоненты, извлекаем их описание
        if (material) {
          const materialsMatch = components.match(/М\s*\((.*)\)/);
          if (materialsMatch) {
            materials = materialsMatch[1].trim();
          }
        }
      }
    }
    
    // Ищем длительность
    const durationLine = lines.find(line => /длительн|продолжительн/i.test(line));
    let duration = 'Мгновенная';
    let concentration = false;
    
    if (durationLine) {
      const durationMatch = durationLine.match(/длительн[^:]*:\s*(.*)/i) || 
                           durationLine.match(/продолжительн[^:]*:\s*(.*)/i);
      if (durationMatch) {
        duration = durationMatch[1].trim();
        concentration = /концентрац/i.test(duration);
      }
    }
    
    // Собираем описание из оставшихся строк
    const descriptionStartIndex = lines.findIndex(line => 
      /описание|действие/i.test(line)) + 1;
    
    const description = descriptionStartIndex > 0 && descriptionStartIndex < lines.length 
      ? lines.slice(descriptionStartIndex).join('\n')
      : '';
    
    // Ищем классы (если есть)
    const classesLine = lines.find(line => /класс|список/i.test(line) && /заклинани/i.test(line));
    let classes: string[] = [];
    
    if (classesLine) {
      const classMatch = classesLine.match(/класс[^:]*:\s*(.*)/i) || 
                       classesLine.match(/список[^:]*:\s*(.*)/i);
      if (classMatch) {
        classes = classMatch[1].split(',').map(c => c.trim());
      }
    }
    
    // Формируем итоговый объект заклинания
    return {
      id: `spell-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      level,
      school,
      castingTime,
      range,
      components,
      duration,
      description,
      classes,
      ritual: /ритуал/i.test(text),
      concentration,
      verbal,
      somatic,
      material,
      materials
    };
  } catch (error) {
    console.error('Error parsing spell:', error);
    return null;
  }
}
