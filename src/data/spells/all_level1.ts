
import { CharacterSpell } from '@/types/character';
import { level1 } from './level1';

// Заклинания 1-го уровня
export const allLevel1Spells: CharacterSpell[] = [
  // Базовые заклинания 1-го уровня
  {
    id: "curewounds",
    name: "Лечение ран",
    level: 1,
    school: "Эвокация",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Мгновенная",
    description: "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1d8 + ваш модификатор заклинательной способности. Это заклинание не оказывает влияние на нежить или конструктов.",
    classes: ["Бард", "Друид", "Паладин", "Следопыт", "Жрец"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false,
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 2 уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше первого.",
    source: "PHB"
  },
  {
    id: "magicmissile",
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
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 2 уровня или выше, заклинание создаёт на одну стрелу больше за каждый уровень выше первого.",
    source: "PHB"
  },
  {
    id: "detectmagic",
    name: "Обнаружение магии",
    level: 1,
    school: "Прорицание",
    castingTime: "1 действие",
    range: "На себя",
    components: "В, С",
    duration: "Концентрация, вплоть до 10 минут",
    description: "Пока заклинание активно, вы чувствуете присутствие магии в пределах 30 футов от себя. Если вы чувствуете магию, вы можете действием увидеть слабую ауру вокруг видимого существа или объекта, несущего магию, и узнать его школу магии, если она есть.",
    classes: ["Бард", "Друид", "Волшебник", "Жрец", "Паладин", "Следопыт", "Чародей"],
    ritual: true,
    concentration: true,
    verbal: true,
    somatic: true,
    material: false,
    source: "PHB"
  },
];

export default allLevel1Spells;
