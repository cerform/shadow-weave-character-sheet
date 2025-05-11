
import { CharacterSpell } from '@/types/character';
import { slugify } from '@/utils/stringUtils';

export const level3: CharacterSpell[] = [
  {
    id: slugify("защита-от-энергии"),
    name: "Защита от энергии",
    level: 3,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    duration: "Концентрация, вплоть до 1 часа",
    verbal: true,
    somatic: false,
    material: false,
    ritual: false,
    concentration: true,
    description: "На время длительности заклинания существо, которого вы коснулись, получает сопротивление к одному виду урона на ваш выбор: звуку, кислоте, огню, холоду или электричеству.",
    classes: ["Жрец", "Друид", "Следопыт", "Чародей", "Волшебник"]
  },
  {
    id: slugify("молния"),
    name: "Молния",
    level: 3,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С, М (кусочек меха и стеклянный или янтарный жезл)",
    duration: "Мгновенная",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    concentration: true,
    description: "Разряд молнии образует линию длиной 100 футов и шириной 5 футов, исходящую от вас в выбранном направлении. Все существа в линии должны совершить спасбросок Ловкости. Существа получают урон электричеством 8к6 при провале или половину этого урона при успехе.",
    classes: ["Чародей", "Волшебник"]
  }
];
