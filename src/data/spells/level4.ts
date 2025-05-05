
import { CharacterSpell } from '@/types/character';
import { wrapWithPrepared } from './ensureSpellFields';

const spellsBase = [
  {
    name: "Аура жизни",
    level: 4,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "На себя (30-футовый радиус)",
    components: "КВ",
    verbal: true,
    somatic: false,
    material: false,
    concentration: true,
    ritual: false,
    duration: "Концентрация, вплоть до 10 минут",
    description: "Жизненная энергия исходит от вас, окружая ваших друзей и защищая их от смерти. Вы и все дружественные существа в пределах 30 футов от вас имеют сопротивление к урону некротической энергией, а их максимум хитов не может быть уменьшен. Кроме того, живое существо, если у него 0 хитов, восстанавливает 1 хит, когда впервые начинает свой ход в ауре.",
    classes: ["Паладин", "Жрец"]
  },
  {
    name: "Аура очищения",
    level: 4,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "На себя (30-футовый радиус)",
    components: "КВ",
    verbal: true,
    somatic: false,
    material: false,
    concentration: true,
    ritual: false,
    duration: "Концентрация, вплоть до 10 минут",
    description: "Очищающая энергия исходит от вас, окружая ваших друзей и защищая их от болезней. Вы и все дружественные существа в пределах 30 футов от вас имеют иммунитет к болезням и ядам, а существа, очарованные, парализованные или отравленные, могут совершить новый спасбросок при входе в ауру.",
    classes: ["Паладин", "Жрец"]
  }
];

// Оборачиваем все заклинания, добавляя поле prepared
export const level4: CharacterSpell[] = wrapWithPrepared(spellsBase);
