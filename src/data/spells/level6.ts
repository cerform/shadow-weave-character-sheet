
import { CharacterSpell } from '@/types/character';
import { wrapWithPrepared } from './ensureSpellFields';

const baseSpells = [
  // Заклинания 6-го уровня
  {
    name: "Преграда жизни",
    level: 6,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В, С, М",
    duration: "Концентрация, вплоть до 10 минут",
    concentration: true,
    description: "Вы создаёте преграду энергии, отражающей мертвых. Преграда появляется в точке, выбранной вами в пределах дистанции, и образует куб с длиной ребра 10 футов. Преграда существует в течение времени действия заклинания. Она блокирует для нежити и существ, созданных заклинаниями школы некромантии, вход в область, защищённую этой преградой.",
    verbal: true,
    somatic: true,
    material: true,
    ritual: false,
    classes: ["Друид", "Жрец", "Паладин"]
  }
  // Другие заклинания можно добавить здесь при необходимости
];

// Оборачиваем в функцию для добавления поля prepared и других необходимых полей
export const level6: CharacterSpell[] = wrapWithPrepared(baseSpells);
