
import { SpellData } from '@/types/spells';

export const level1: SpellData[] = [
  {
    id: "shield",
    name: "Щит",
    name_en: "Shield",
    level: 1,
    school: "Ограждение",
    castingTime: "1 реакция",
    range: "На себя",
    components: "В, С",
    duration: "1 раунд",
    description: "Невидимый барьер защищает вас. До начала вашего следующего хода вы получаете бонус +5 к КД, в том числе и против спровоцировавшей это заклинание атаки, и не получаете урона от волшебной стрелы.",
    classes: ["Волшебник", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false
  },
  {
    id: "magic-missile",
    name: "Волшебная стрела",
    name_en: "Magic Missile",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте три светящиеся стрелы из магической энергии. Каждая стрела попадает в существо на ваш выбор, которое вы видите в пределах дистанции. Стрела причиняет урон силовым полем 1к4 + 1. Все стрелы выпускаются одновременно, и вы можете направить их как в одну, так и в разные цели.",
    classes: ["Волшебник", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false,
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 2 уровня или выше, заклинание создаёт на одну стрелу больше за каждый уровень ячейки выше первого."
  }
];
