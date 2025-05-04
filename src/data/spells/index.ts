
import { CharacterSpell } from '@/types/character';
import { isString, isStringArray, safeJoin } from '@/hooks/spellbook/filterUtils';

// Список заклинаний
export const spells: CharacterSpell[] = [
  {
    id: 1,
    name: "Волшебная стрела",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаете три светящиеся стрелы из силового поля. Каждая стрела поражает существо по вашему выбору, которое вы можете видеть в пределах дистанции. Стрела наносит урон силовым полем 1d4 + 1.",
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 2 уровня или выше, вы создаете одну дополнительную стрелу за каждый уровень ячейки выше первого.",
    classes: ["Волшебник", "Чародей"],
    verbal: true,
    somatic: true,
    ritual: false,
    concentration: false
  },
  {
    id: 2,
    name: "Огненный шар",
    level: 3,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "150 футов",
    components: "В, С, М (крошечный шарик летучей серы)",
    duration: "Мгновенная",
    description: "Из вашего пальца вылетает яркая полоска, летящая к выбранной точке в пределах дистанции, а затем распускается с низким грохотом и взрывается огнём. Все существа в пределах 20-футовой сферы с центром в этой точке должны совершить спасбросок Ловкости. Цель получает урон огнём 8d6 при провале или половину этого урона при успехе.",
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше третьего.",
    classes: ["Волшебник", "Чародей"],
    verbal: true,
    somatic: true,
    material: true,
    ritual: false,
    concentration: false
  },
  {
    id: 3,
    name: "Лечение ран",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Мгновенная",
    description: "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1d8 + модификатор вашей базовой характеристики. Это заклинание не оказывает никакого эффекта на нежить и конструктов.",
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше первого.",
    classes: ["Бард", "Друид", "Жрец", "Паладин", "Следопыт"],
    verbal: true,
    somatic: true,
    ritual: false,
    concentration: false
  },
  {
    id: 4,
    name: "Малая иллюзия",
    level: 0,
    school: "Иллюзия",
    castingTime: "1 действие",
    range: "30 футов",
    components: "С, М (кусочек овечьей шерсти)",
    duration: "1 минута",
    description: "Вы создаете либо звук, либо образ объекта, который существует, пока активно заклинание. Иллюзия оканчивается, когда вы повторно накладываете это заклинание.",
    classes: ["Волшебник", "Бард"],
    somatic: true,
    material: true,
    ritual: false,
    concentration: false
  },
  {
    id: 5,
    name: "Щит",
    level: 1,
    school: "Ограждение",
    castingTime: "1 реакция",
    range: "На себя",
    components: "В, С",
    duration: "1 раунд",
    description: "Невидимый барьер из магической силы появляется и защищает вас. До начала вашего следующего хода вы получаете бонус +5 к КД, включая спровоцировавшую атаку, и не получаете урона от магической ракеты.",
    classes: ["Волшебник", "Чародей"],
    verbal: true,
    somatic: true,
    ritual: false,
    concentration: false
  }
];

// Helper function for getting spells by class
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  if (!className) return [];
  return spells.filter(spell => {
    if (!spell.classes) return false;
    if (isString(spell.classes)) {
      return spell.classes === className;
    }
    if (isStringArray(spell.classes)) {
      return spell.classes.some(cls => cls === className);
    }
    return false;
  });
};

// Helper function for getting spells by level
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter(spell => spell.level === level);
};

// Helper function for getting spell details by name
export const getSpellDetails = (spellName: string): CharacterSpell | null => {
  if (!spellName) return null;
  return spells.find(spell => spell.name === spellName) || null;
};

// Exporting a function to get all spells
export const getAllSpells = () => {
  return spells;
};
