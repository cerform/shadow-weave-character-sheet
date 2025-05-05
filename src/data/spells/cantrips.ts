
import { CharacterSpell } from '@/types/character';
import { wrapWithPrepared } from './ensureSpellFields';

const baseSpells = [
  {
    id: "light",  // ИД останется строкой, а далее мы преобразуем его
    name: "Свет",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, М",
    duration: "1 час",
    description: "Вы касаетесь одного предмета, не превышающего 10 футов в любом измерении. Пока заклинание активно, предмет испускает яркий свет в радиусе 20 футов и тусклый свет в пределах ещё 20 футов. Свет может быть любого цвета на ваш выбор.",
    verbal: true,
    somatic: false,
    material: true,
    materialComponents: "Светлячок или фосфоресцирующий мох",
    ritual: false,
    concentration: false,
    classes: ["Бард", "Жрец", "Чародей", "Волшебник"]
  },
  {
    id: "dancing-lights",
    name: "Пляшущие огоньки",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 фт",
    components: "В, С, М",
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы создаёте до четырёх огоньков размером с факел, которые парят в воздухе в пределах дистанции. Вы можете перемещать их на расстояние до 60 футов бонусным действием.",
    verbal: true,
    somatic: true,
    material: true,
    materialComponents: "Кусочек фосфора или гнилушка, или светлячок",
    ritual: false,
    concentration: true,
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    id: "mage-hand",
    name: "Волшебная рука",
    level: 0,
    school: "Призыв",
    castingTime: "1 действие",
    range: "30 фт",
    components: "В, С",
    duration: "1 минута",
    description: "Призрачная парящая рука появляется в указанной вами точке в пределах дистанции и существует, пока заклинание активно, или пока вы не отпустите её действием.",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    concentration: false,
    classes: ["Бард", "Чародей", "Колдун", "Волшебник"]
  }
];

// Оборачиваем в функцию для добавления поля prepared и других необходимых полей
export const spells: CharacterSpell[] = wrapWithPrepared(baseSpells);
