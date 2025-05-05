// Вспомогательные функции для работы с заклинаниями
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

export const isCharacterSpellObject = (spell: any): spell is any => {
  return typeof spell === 'object' && spell !== null;
};

export const getSpellLevel = (spell: any): number => {
  if (typeof spell === 'string') {
    return 0; // По умолчанию заговоры
  }
  return spell.level || 0;
};

export const isSpellPrepared = (spell: any): boolean => {
  if (typeof spell === 'string') {
    return false;
  }
  return !!spell.prepared;
};

export const getSpellSchool = (school: string): string => {
  const schoolTranslations: Record<string, string> = {
    'abjuration': 'Ограждение',
    'conjuration': 'Призыв',
    'divination': 'Прорицание',
    'enchantment': 'Очарование',
    'evocation': 'Воплощение',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'transmutation': 'Преобразование',
    'universal': 'Универсальная'
  };
  
  return schoolTranslations[school.toLowerCase()] || school;
};

export const getSpellComponents = (components: string): { verbal: boolean; somatic: boolean; material: boolean; materials?: string } => {
  const verbal = components.toLowerCase().includes('в') || components.toLowerCase().includes('v');
  const somatic = components.toLowerCase().includes('с') || components.toLowerCase().includes('s');
  
  let material = false;
  let materials = '';
  
  // Проверяем на наличие материальных компонентов
  if (components.toLowerCase().includes('м') || components.toLowerCase().includes('m')) {
    material = true;
    
    // Извлекаем описание материальных компонентов, если они указаны в скобках
    const match = components.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      materials = match[1].trim();
    }
  }
  
  return { verbal, somatic, material, materials };
};

export const getSpellDuration = (duration: string): { concentration: boolean; duration: string } => {
  const isConcentration = duration.toLowerCase().includes('концентрация') || 
                          duration.toLowerCase().includes('concentration');
  
  // Удаляем упоминание о концентрации из строки продолжительности
  let cleanDuration = duration;
  if (isConcentration) {
    cleanDuration = duration.replace(/концентрация,?\s*/i, '').replace(/concentration,?\s*/i, '');
  }
  
  return { concentration: isConcentration, duration: cleanDuration };
};

export const getSpellCastingTime = (castingTime: string): string => {
  const timeTranslations: Record<string, string> = {
    '1 action': '1 действие',
    'bonus action': 'бонусное действие',
    'reaction': 'реакция',
    'minute': 'минута',
    'minutes': 'минут',
    'hour': 'час',
    'hours': 'часов'
  };
  
  let result = castingTime;
  for (const [eng, rus] of Object.entries(timeTranslations)) {
    result = result.replace(new RegExp(eng, 'gi'), rus);
  }
  
  return result;
};

// Добавляем функцию преобразования массива заклинаний персонажа в SpellData
export const convertCharacterSpellsToSpellData = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: 'В, С',
        duration: 'Мгновенная',
        description: 'Нет описания',
      };
    }
    return convertCharacterSpellToSpellData(spell);
  });
};
