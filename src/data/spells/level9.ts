
import { CharacterSpell } from '@/types/character';
import { wrapWithPrepared } from './ensureSpellFields';

const baseSpells = [
  // Заклинания 9-го уровня
  {
    name: "Истинное воскрешение",
    level: 9,
    school: "Некромантия",
    castingTime: "1 час",
    range: "Касание",
    components: "В, С, М",
    duration: "Мгновенная",
    concentration: false,
    ritual: false,
    description: "Вы касаетесь существа, умершего не более 200 лет назад. Если душа существа свободна и хочет вернуться, существо возвращается к жизни со всеми своими хитами. Это заклинание закрывает все раны, нейтрализует все яды, излечивает все болезни и снимает все проклятья, действовавшие на существо при его смерти. Заклинание заменяет повреждённые или отсутствующие органы и конечности.",
    verbal: true,
    somatic: true,
    material: true,
    classes: ["Друид", "Жрец"]
  }
  // Другие заклинания можно добавить здесь при необходимости
];

// Оборачиваем в функцию для добавления поля prepared и других необходимых полей
export const level9: CharacterSpell[] = wrapWithPrepared(baseSpells);
