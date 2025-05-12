
import { SpellData } from '@/types/spells';

// Sample spells array for testing
export const spells: SpellData[] = [
  {
    id: "1",
    name: "Волшебная стрела",
    level: 1,
    school: "Эвокация",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаете три светящиеся стрелы из магической энергии. Каждая стрела попадает в существо на ваш выбор, которое вы можете видеть в пределах дистанции. Стрела наносит урон силовым полем 1d4 + 1. Стрелы бьют одновременно, и вы можете направить их в одно существо или несколько.",
    classes: ["Волшебник", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false,
    source: "Player's Handbook"
  },
  {
    id: "2",
    name: "Огненный шар",
    level: 3,
    school: "Эвокация",
    castingTime: "1 действие",
    range: "150 футов",
    components: "В, С, М",
    duration: "Мгновенная",
    description: "Яркая вспышка устремляется из вашего пальца к выбранной точке в пределах дистанции, где взрывается с низким рёвом, извергая пламя. Все существа в сфере радиусом 20 футов с центром в этой точке должны совершить спасбросок Ловкости. Цель получает урон огнём 8d6 при провале или половину урона при успехе.",
    classes: ["Волшебник", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: true,
    materials: "Крошечный шарик серы и летучей смолы",
    source: "Player's Handbook"
  },
  {
    id: "3",
    name: "Лечение ран",
    level: 1,
    school: "Эвокация",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Мгновенная",
    description: "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1d8 + ваш модификатор заклинательной способности. Это заклинание не оказывает влияния на нежить или конструктов.",
    classes: ["Бард", "Друид", "Паладин", "Следопыт", "Жрец"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false,
    source: "Player's Handbook"
  },
  {
    id: "4",
    name: "Огненный снаряд",
    level: 0,
    school: "Эвокация",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы бросаете комок огня в существо или предмет в пределах дистанции. Совершите дальнобойную атаку заклинанием по цели. При попадании цель получает урон огнём 1d10. Горючие предметы, по которым попал этот заклинание, загораются, если они не несёт никто и не держит их в руках.",
    classes: ["Чародей", "Волшебник"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false,
    source: "Player's Handbook"
  },
  {
    id: "5",
    name: "Свет",
    level: 0,
    school: "Эвокация",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, М",
    duration: "1 час",
    description: "Вы касаетесь одного предмета, не превышающего 10 футов в любом измерении. Пока заклинание активно, предмет испускает яркий свет в радиусе 20 футов и тусклый свет в пределах ещё 20 футов. Свет может быть любого выбранного вами цвета. Полное покрытие предмета чем-нибудь непрозрачным блокирует свет. Заклинание оканчивается, если вы наложите его ещё раз, или окончите его действием.",
    classes: ["Бард", "Жрец", "Волшебник", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: false,
    material: true,
    materials: "Светлячок или фосфоресцирующий мох",
    source: "Player's Handbook"
  }
];

// Функция получения деталей заклинания по имени
export const getSpellDetails = (spellName: string) => {
  return spells.find((spell) => spell.name === spellName) || null;
};

// Функция получения всех заклинаний
export const getAllSpells = () => {
  return spells;
};

// Функция получения заклинаний по классу
export const getSpellsByClass = (className: string) => {
  const lowerClassName = className.toLowerCase();
  
  // Соответствие между русскими и английскими названиями классов
  const classNameMapping: Record<string, string[]> = {
    'жрец': ['cleric', 'жрец'],
    'волшебник': ['wizard', 'волшебник'],
    'друид': ['druid', 'друид'],
    'бард': ['bard', 'бард'],
    'колдун': ['warlock', 'колдун'],
    'чародей': ['sorcerer', 'чародей'],
    'паладин': ['paladin', 'паладин'],
    'следопыт': ['ranger', 'следопыт']
  };
  
  // Получаем все возможные варианты названия класса
  const possibleClassNames = classNameMapping[lowerClassName] || [lowerClassName];
  
  console.log(`Looking for spells for class: ${className}, possible names:`, possibleClassNames);
  
  // Фильтруем заклинания по классу
  return spells.filter((spell) => {
    if (!spell.classes) return false;
    
    const spellClasses = typeof spell.classes === 'string' 
      ? [spell.classes.toLowerCase()] 
      : spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '');
    
    // Проверяем, есть ли хотя бы одно совпадение между возможными именами класса и классами заклинания
    const matches = spellClasses.some(cls => possibleClassNames.includes(cls));
    return matches;
  });
};

// Функция получения заклинаний по уровню
export const getSpellsByLevel = (level: number) => {
  return spells.filter((spell) => spell.level === level);
};

// Функция получения заклинаний по школе магии
export const getSpellsBySchool = (school: string) => {
  const lowerSchool = school.toLowerCase();
  return spells.filter((spell) => {
    return typeof spell.school === 'string' && spell.school.toLowerCase() === lowerSchool;
  });
};
