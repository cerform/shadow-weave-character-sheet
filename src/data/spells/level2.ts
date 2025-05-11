
import { CharacterSpell } from '@/types/character';
import { slugify } from '@/utils/stringUtils';

export const level2: CharacterSpell[] = [
  {
    id: slugify("видение-невидимого"),
    name: "Видение невидимого",
    level: 2,
    school: "Прорицание",
    castingTime: "1 действие",
    range: "На себя",
    components: "В, С, М (щепотка талька и немного серебряного порошка)",
    verbal: true,
    somatic: true,
    material: true,
    concentration: true,
    duration: "Концентрация, вплоть до 1 часа",
    description: "На время действия заклинания вы видите невидимых существ и предметы, как если бы они были видимы, а также видите в эфирном плане. Эфирные существа и предметы выглядят как бестелесные, полупрозрачные формы.",
    classes: ["Бард", "Волшебник", "Колдун", "Следопыт"]
  },
  {
    id: slugify("власть-над-разумом"),
    name: "Власть над разумом",
    level: 2,
    school: "Очарование",
    castingTime: "1 действие",
    range: "18 метров",
    components: "В, С, М (небольшой, изогнутый кусочек железа)",
    verbal: true,
    somatic: true,
    material: true,
    duration: "1 раунд",
    description: "Вы проникаете в разум существа, которое видите в пределах дистанции, заставляя его совершить спасбросок Интеллекта. Если цель его проваливает, она получает 3к6 психического урона, и она должна тратить своё перемещение, подходя к вам по кратчайшему и самому прямому пути, избегая опасных веществ, таких как огонь и ямы.",
    classes: ["Волшебник"]
  }
];

export const level2Spells = level2; // Alternate export for backward compatibility
