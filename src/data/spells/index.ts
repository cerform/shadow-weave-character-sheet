
import { CharacterSpell } from '@/types/character';

// Функция проверки, является ли значение строкой
const isString = (value: unknown): value is string => typeof value === 'string';

// Функция проверки, является ли значение массивом строк
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Функция для фильтрации заклинаний по классу
export const filterSpellsByClass = (
  spells: CharacterSpell[], 
  characterClass: string[]
): CharacterSpell[] => {
  if (!characterClass.length) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (isString(spell.classes)) {
      return characterClass.includes(spell.classes);
    }
    
    if (isStringArray(spell.classes)) {
      return spell.classes.some(cls => characterClass.includes(cls));
    }
    
    return false;
  });
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (
  spells: CharacterSpell[], 
  maxLevel: number
): CharacterSpell[] => {
  return spells.filter(spell => spell.level <= maxLevel);
};

// Пример тестовых заклинаний
export const sampleSpells: CharacterSpell[] = [
  {
    id: 1,
    name: "Волшебная рука",
    level: 0,
    school: "Преобразование",
    description: "Появляется призрачная парящая рука, которую вы можете контролировать. Она может манипулировать объектами, открывать незапертые двери и т.д.",
    castingTime: "1 действие",
    range: "30 футов",
    components: "В, С",
    duration: "1 минута",
    classes: ["Бард", "Волшебник", "Колдун", "Чародей"]
  },
  {
    id: 2,
    name: "Огненный снаряд",
    level: 1,
    school: "Воплощение",
    description: "Вы бросаете сгусток огня. Совершите дальнобойную атаку заклинанием. При попадании цель получает урон огнём 1d10.",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    classes: ["Волшебник", "Чародей"]
  },
  {
    id: 3,
    name: "Лечащее слово",
    level: 1,
    school: "Исцеление",
    description: "Существо, которое вы можете видеть, восстанавливает количество хитов, равное 1d4 + ваш модификатор базовой характеристики.",
    castingTime: "1 бонусное действие",
    range: "60 футов",
    components: "В",
    duration: "Мгновенная",
    classes: ["Бард", "Друид", "Жрец"]
  }
];

// Получение всех доступных заклинаний
export const getAllSpells = (): CharacterSpell[] => {
  // В реальности здесь был бы импорт из базы данных или API
  return [...sampleSpells];
};

// Поиск заклинания по имени
export const getSpellByName = (name: string): CharacterSpell | undefined => {
  return getAllSpells().find(spell => 
    spell.name.toLowerCase() === name.toLowerCase()
  );
};

// Функция для получения детальной информации о заклинании
export const getSpellDetails = (spellNameOrObj: string | CharacterSpell): CharacterSpell | undefined => {
  if (typeof spellNameOrObj === 'object') {
    return spellNameOrObj;
  }
  
  return getSpellByName(spellNameOrObj);
};

// Экспорт заклинаний и функций
export const spells = getAllSpells();
export default {
  getAllSpells,
  getSpellByName,
  getSpellDetails,
  filterSpellsByClass,
  filterSpellsByLevel,
  spells
};
