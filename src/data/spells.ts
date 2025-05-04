
import { CharacterSpell } from '@/types/character';

// Пример данных заклинаний
const spellsData: CharacterSpell[] = [
  {
    id: 1,
    name: "Волшебная стрела",
    level: 1,
    description: "Вы создаете три светящиеся стрелы из магической силы. Каждая стрела поражает существо по вашему выбору, которое вы можете видеть, в пределах дистанции.",
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    classes: ["Чародей", "Волшебник"]
  },
  {
    id: 2,
    name: "Огненные ладони",
    level: 1,
    description: "Когда вы вытягиваете руки ладонями вперед, из кончиков ваших растопыренных пальцев вырывается тонкий лист пламени.",
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Конус 15 футов",
    components: "В, С",
    duration: "Мгновенная",
    classes: ["Чародей", "Волшебник"]
  },
  {
    id: 3,
    name: "Лечение ран",
    level: 1,
    description: "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1d8 + ваш модификатор базовой характеристики.",
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Мгновенная",
    classes: ["Бард", "Друид", "Жрец", "Паладин", "Следопыт"]
  }
];

// Функция для получения деталей заклинания по имени
export const getSpellDetails = (spellName: string): CharacterSpell | undefined => {
  return spellsData.find(spell => spell.name.toLowerCase() === spellName.toLowerCase());
};

// Функция для получения всех заклинаний
export const getAllSpells = (): CharacterSpell[] => {
  return spellsData;
};

// Функция для получения заклинаний определенного уровня
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spellsData.filter(spell => spell.level === level);
};

// Функция для получения заклинаний определенного класса
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spellsData.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.includes(className);
    } else if (typeof spell.classes === 'string') {
      return spell.classes === className;
    }
    return false;
  });
};
