
import { SpellData } from '@/types/spells';

// Базовый набор заклинаний для разных классов
const basicSpells: SpellData[] = [
  {
    id: "magic-missile",
    name: "Волшебная стрела",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте три светящиеся стрелы силового поля. Каждая из них попадает в существо по вашему выбору, которое вы можете видеть в пределах дистанции.",
    classes: ["волшебник", "чародей"],
  },
  {
    id: "cure-wounds",
    name: "Лечение ран",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Мгновенная",
    description: "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1к8 + ваш модификатор базовой характеристики.",
    classes: ["жрец", "друид", "паладин", "бард"],
  },
  {
    id: "light",
    name: "Свет",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, М (светлячок или фосфоресцирующий мох)",
    duration: "1 час",
    description: "Вы касаетесь одного предмета, размер которого не превышает 10 футов ни в одном измерении. Пока заклинание активно, предмет испускает яркий свет в радиусе 20 футов.",
    classes: ["волшебник", "клирик", "друид", "бард", "чародей"],
  },
  {
    id: "sacred-flame",
    name: "Священное пламя",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Подобное пламени сияние нисходит на существо, которое вы видите в пределах дистанции. Цель должна преуспеть в спасброске Ловкости, иначе она получает урон излучением 1к8.",
    classes: ["жрец"],
  }
];

// Функция получения всех заклинаний
export const getAllSpells = (): SpellData[] => {
  return basicSpells;
};

// Функция получения заклинаний по классу
export const getSpellsByClass = (className: string): SpellData[] => {
  if (!className) return [];
  
  const classLower = className.toLowerCase();
  
  // Создаём соответствие русских и английских названий классов
  const classMap: Record<string, string[]> = {
    'волшебник': ['волшебник', 'wizard'],
    'жрец': ['жрец', 'cleric'],
    'друид': ['друид', 'druid'],
    'бард': ['бард', 'bard'],
    'паладин': ['паладин', 'paladin'],
    'следопыт': ['следопыт', 'ranger'],
    'колдун': ['колдун', 'warlock'],
    'чародей': ['чародей', 'sorcerer']
  };
  
  // Определяем допустимые названия для данного класса
  const validClassNames = classMap[classLower] || [classLower];
  
  // Фильтруем заклинания по классу
  return basicSpells.filter(spell => {
    if (!spell.classes) return false;
    
    const spellClasses = Array.isArray(spell.classes) 
      ? spell.classes.map(c => c.toLowerCase()) 
      : [spell.classes.toLowerCase()];
      
    return spellClasses.some(c => validClassNames.includes(c));
  });
};
