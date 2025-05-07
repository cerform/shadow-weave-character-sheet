
import { SpellData } from '@/types/spells';

export const level8: SpellData[] = [
  {
    id: "power-word-stun",
    name: "Слово силы: оглушение",
    name_en: "Power Word Stun",
    level: 8,
    school: "Очарование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В",
    duration: "Мгновенная",
    description: "Вы произносите слово силы, способное перегрузить разум существа, которое вы видите в пределах дистанции, и ввергнуть его в ступор. Если выбранное существо имеет 150 или менее хитов, оно становится ошеломлённым. В противном случае это заклинание не действует.",
    classes: ["Бард", "Волшебник", "Колдун", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: false,
    material: false
  }
];
