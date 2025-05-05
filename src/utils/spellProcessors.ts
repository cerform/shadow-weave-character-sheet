
import { CharacterSpell } from '@/types/character';

// Обрабатывает строку компонентов (например, "ВСМ") и возвращает объект с флагами
export const parseComponents = (componentStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  const verbal = componentStr.includes('В');
  const somatic = componentStr.includes('С');
  const material = componentStr.includes('М');
  const ritual = componentStr.includes('Р');
  const concentration = componentStr.includes('К');
  
  return { verbal, somatic, material, ritual, concentration };
};

// Обновляет заклинание компонентами
export const updateSpellWithComponents = (
  spell: CharacterSpell, 
  components: { verbal: boolean; somatic: boolean; material: boolean; ritual: boolean; concentration: boolean }
): CharacterSpell => {
  return {
    ...spell,
    verbal: components.verbal,
    somatic: components.somatic,
    material: components.material,
    ritual: components.ritual,
    concentration: components.concentration
  };
};

// Форматирует список классов
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  return classes;
};

// Генерирует строку компонентов (например, "ВСМ") из флагов
export const generateComponentsString = (
  verbal: boolean | undefined, 
  somatic: boolean | undefined, 
  material: boolean | undefined
): string => {
  let componentStr = '';
  if (verbal) componentStr += 'В';
  if (somatic) componentStr += 'С';
  if (material) componentStr += 'М';
  return componentStr;
};

/**
 * Рассчитывает доступное количество заклинаний и заговоров
 * для класса и уровня
 */
export const calculateAvailableSpellsByClassAndLevel = (
  className: string,
  level: number,
  abilities?: {
    wisdom?: number;
    intelligence?: number;
    charisma?: number;
  }
): { spells: number; cantrips: number; maxSpellLevel: number } => {
  // Значения по умолчанию
  let spells = 0;
  let cantrips = 0;
  let maxSpellLevel = 0;
  
  // Мудрость для жрецов и друидов
  const wisdomMod = abilities?.wisdom ? Math.floor((abilities.wisdom - 10) / 2) : 0;
  // Интеллект для волшебников
  const intMod = abilities?.intelligence ? Math.floor((abilities.intelligence - 10) / 2) : 0;
  // Харизма для бардов, чародеев и колдунов
  const chaMod = abilities?.charisma ? Math.floor((abilities.charisma - 10) / 2) : 0;
  
  // Определяем доступное количество заклинаний по классу и уровню
  switch (className) {
    case "Волшебник":
      // Волшебник: 6 заклинаний на 1 уровне + 2 за каждый уровень после первого
      cantrips = level <= 3 ? 3 : level <= 9 ? 4 : 5;
      spells = 6 + ((level > 1) ? (level - 1) * 2 : 0);
      // Макс. уровень заклинаний по уровню персонажа
      maxSpellLevel = Math.ceil(level / 2);
      break;
      
    case "Жрец":
    case "Друид":
      // Жрец/Друид: модификатор мудрости + уровень
      cantrips = level <= 3 ? 3 : level <= 9 ? 4 : 5;
      spells = level + wisdomMod;
      maxSpellLevel = Math.ceil(level / 2);
      break;
      
    case "Бард":
      // Бард: зависит от уровня
      cantrips = level <= 9 ? 2 : 3;
      // Формула для известных заклинаний барда
      if (level === 1) spells = 4;
      else if (level === 2) spells = 5;
      else if (level === 3) spells = 6;
      else if (level <= 5) spells = 7;
      else if (level <= 7) spells = 8;
      else if (level <= 9) spells = 9;
      else spells = 10 + (level - 10);
      maxSpellLevel = Math.ceil(level / 2);
      break;
      
    case "Следопыт":
      // Следопыт: нет заговоров, заклинания = уровень/2 + мод мудрости
      cantrips = 0;
      if (level >= 2) {
        spells = Math.floor(level / 2) + wisdomMod;
        maxSpellLevel = Math.min(5, Math.ceil((level - 1) / 4));
      }
      break;
      
    case "Паладин":
      // Паладин: нет заговоров, заклинания = уровень/2 + мод харизмы
      cantrips = 0;
      if (level >= 2) {
        spells = Math.floor(level / 2) + chaMod;
        maxSpellLevel = Math.min(5, Math.ceil((level - 1) / 4));
      }
      break;
      
    case "Чародей":
    case "Колдун":
      // Чародей/Колдун: известные заклинания зависят от уровня
      cantrips = level <= 9 ? 2 + Math.floor(level / 6) : 4;
      if (level === 1) spells = 2;
      else if (level === 2) spells = 3;
      else if (level === 3) spells = 4;
      else if (level <= 5) spells = 5;
      else if (level <= 7) spells = 6;
      else if (level <= 9) spells = 7;
      else if (level <= 11) spells = 8;
      else if (level <= 13) spells = 9;
      else if (level <= 15) spells = 10;
      else if (level <= 17) spells = 11;
      else spells = 12;
      maxSpellLevel = Math.ceil(level / 2);
      break;
      
    case "Чернокнижник":
      // Чернокнижник: известные заклинания зависят от уровня
      cantrips = level <= 3 ? 2 : level <= 9 ? 3 : 4;
      if (level === 1) spells = 2;
      else if (level === 2) spells = 3;
      else if (level <= 4) spells = 4;
      else if (level <= 6) spells = 5;
      else if (level <= 8) spells = 6;
      else if (level === 9) spells = 7;
      else if (level === 10) spells = 8;
      else if (level <= 12) spells = 9;
      else if (level <= 14) spells = 10;
      else if (level <= 16) spells = 11;
      else if (level <= 18) spells = 12;
      else spells = 13;
      maxSpellLevel = Math.ceil(level / 2);
      break;
  }
  
  // Убеждаемся, что количество заклинаний не отрицательное
  spells = Math.max(0, spells);
  cantrips = Math.max(0, cantrips);
  maxSpellLevel = Math.max(0, Math.min(9, maxSpellLevel));
  
  return { spells, cantrips, maxSpellLevel };
};
