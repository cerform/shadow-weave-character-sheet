
import { CharacterSpell } from '@/types/character';

// Это заглушка для функций, возвращающих заклинания
// В реальном приложении здесь будут реальные данные о заклинаниях

// Получение всех заклинаний
export const getAllSpells = (): CharacterSpell[] => {
  return [
    {
      id: 1,
      name: "Огненный шар",
      level: 3,
      school: "Воплощение",
      castingTime: "1 действие",
      range: "150 фт",
      components: "В, С, М",
      duration: "Мгновенная",
      description: "Яркий луч вырывается из вашего указательного пальца и выстреливает в точку, которую вы выберете в пределах дистанции. Каждое существо в пределах 20-футовой сферы от этой точки должно совершить спасбросок Ловкости. Цель получает 8d6 урона огнём при провале или половину этого урона при успехе.",
      prepared: false,
      verbal: true,
      somatic: true,
      material: true,
      materialComponents: "Крошечный шарик из летучей серы, гуано и жира",
      ritual: false,
      concentration: false,
      higherLevels: "Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.",
      classes: ["Волшебник", "Чародей"]
    },
    {
      id: 2,
      name: "Волшебная стрела",
      level: 1,
      school: "Воплощение",
      castingTime: "1 действие",
      range: "120 фт",
      components: "В, С",
      duration: "Мгновенная",
      description: "Вы создаёте три светящиеся стрелы из магической силы. Каждая стрела поражает существо на ваш выбор, которое вы можете видеть в пределах дистанции. Стрела наносит урон силовым полем 1d4 + 1.",
      prepared: false,
      verbal: true,
      somatic: true,
      material: false,
      ritual: false,
      concentration: false,
      higherLevels: "Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, заклинание создаёт одну дополнительную стрелу за каждый уровень ячейки выше 1-го.",
      classes: ["Волшебник", "Чародей"]
    },
    {
      id: 3,
      name: "Лечение ран",
      level: 1,
      school: "Очарование",
      castingTime: "1 действие",
      range: "Касание",
      components: "В, С",
      duration: "Мгновенная",
      description: "Существо, которого вы касаетесь, восстанавливает количество хитов, равное 1d8 + ваш модификатор базовой характеристики. Это заклинание не оказывает никакого эффекта на нежить и конструктов.",
      prepared: false,
      verbal: true,
      somatic: true,
      material: false,
      ritual: false,
      concentration: false,
      higherLevels: "Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше 1-го.",
      classes: ["Бард", "Друид", "Жрец", "Паладин", "Следопыт"]
    }
  ];
};

// Получение заклинаний по классу
export const getSpellsByClass = (characterClass: string): CharacterSpell[] => {
  const allSpells = getAllSpells();
  return allSpells.filter(spell => 
    spell.classes && 
    (Array.isArray(spell.classes) 
      ? spell.classes.includes(characterClass)
      : spell.classes === characterClass)
  );
};
