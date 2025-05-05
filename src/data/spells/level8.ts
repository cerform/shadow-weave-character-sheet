
import { CharacterSpell } from '@/types/character';
import { wrapWithPrepared } from './ensureSpellFields';

const baseSpells = [
  // Заклинания 8-го уровня
  {
    name: "Доминирование над чудовищем",
    level: 8,
    school: "Очарование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В, С",
    duration: "Концентрация, вплоть до 1 часа",
    concentration: true,
    ritual: false,
    description: "Вы пытаетесь переманить на свою сторону существо, которое вы видите в пределах дистанции. Оно должно преуспеть в спасброске Мудрости, иначе становится очарованным на время действия заклинания. Если вы или существа, дружественные вам, сражаетесь с ним, оно получает преимущество при спасброске.",
    verbal: true,
    somatic: true,
    material: false,
    classes: ["Чародей", "Волшебник", "Друид"]
  }
  // Другие заклинания можно добавить здесь при необходимости
];

// Оборачиваем в функцию для добавления поля prepared и других необходимых полей
export const level8: CharacterSpell[] = wrapWithPrepared(baseSpells);
