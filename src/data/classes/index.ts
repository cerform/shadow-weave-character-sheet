import { ClassData } from '@/types/classes';
import monkClassData from './monk';
import artificerClassData from './artificer';
import rangerClassData from './ranger';
import sorcererClassData from './sorcerer';

// Данные о классах D&D 5e
export const classData: Record<string, ClassData> = {
  "бард": {
    name: "Бард",
    hitDice: 8,
    primaryAbility: ["charisma"],
    savingThrows: ["dexterity", "charisma"],
    armorProficiencies: ["light"],
    weaponProficiencies: ["simple", "hand crossbows", "longswords", "rapiers", "shortswords"],
    toolProficiencies: ["three musical instruments of your choice"],
    skillChoices: ["athletics", "acrobatics", "sleight of hand", "stealth", "arcana", "history", "investigation", "nature", "religion", "animal handling", "insight", "medicine", "perception", "survival", "deception", "intimidation", "performance", "persuasion"],
    skillCount: 3,
    spellcasting: {
      ability: "charisma",
      spellSlots: {
        1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
        6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
        7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2],
        8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    },
    features: [
      {
        name: "Бардовское вдохновение",
        level: 1,
        description: "Вы можете вдохновлять других своей музыкой или речью. Для этого бонусным действием вы выбираете одно существо, кроме себя, в пределах 60 футов, которое может вас слышать."
      },
      {
        name: "Мастер на все руки",
        level: 2,
        description: "Вы добавляете половину бонуса мастерства, округлённую в меньшую сторону, ко всем проверкам характеристик, которые уже не имеют этого бонуса."
      }
    ]
  },
  "волшебник": {
    name: "Волшебник",
    hitDice: 6,
    primaryAbility: ["intelligence"],
    savingThrows: ["intelligence", "wisdom"],
    armorProficiencies: [],
    weaponProficiencies: ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"],
    toolProficiencies: [],
    skillChoices: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
    skillCount: 2,
    spellcasting: {
      ability: "intelligence",
      spellSlots: {
        1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
        6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
        7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2],
        8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    },
    features: [
      {
        name: "Восстановление заклинаний",
        level: 1,
        description: "Вы можете восстановить некоторые из своих ячеек заклинаний во время короткого отдыха."
      },
      {
        name: "Школа магии",
        level: 2,
        description: "Вы выбираете школу магии, в которой специализируетесь: Преобразование, Вызов, Прорицание, Очарование, Ограждение, Воплощение, Иллюзия или Некромантия."
      }
    ]
  },
  "жрец": {
    name: "Жрец",
    hitDice: 8,
    primaryAbility: ["wisdom"],
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple"],
    toolProficiencies: [],
    skillChoices: ["history", "insight", "medicine", "persuasion", "religion"],
    skillCount: 2,
    spellcasting: {
      ability: "wisdom",
      spellSlots: {
        1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
        6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
        7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2],
        8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    },
    features: [
      {
        name: "Божественный домен",
        level: 1,
        description: "Вы выбираете божественный домен, связанный с вашим божеством, например, Жизнь, Знание, Свет, Природа, Буря или Война."
      },
      {
        name: "Божественный канал",
        level: 2,
        description: "Вы получаете способность направлять божественную энергию напрямую от вашего божества."
      }
    ]
  },
  "чародей": {
    name: "Чародей",
    hitDice: 6,
    primaryAbility: ["charisma"],
    savingThrows: ["constitution", "charisma"],
    armorProficiencies: [],
    weaponProficiencies: ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"],
    toolProficiencies: [],
    skillChoices: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"],
    skillCount: 2,
    spellcasting: {
      ability: "charisma",
      spellSlots: {
        1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
        6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
        7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2],
        8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      }
    },
    features: [
      {
        name: "Колдовское происхождение",
        level: 1,
        description: "Выберите источник ваших врожденных магических сил"
      },
      {
        name: "Очки чародейства",
        level: 2,
        description: "Вы получаете очки чародейства, равные вашему уровню чародея"
      },
      {
        name: "Метамагия",
        level: 3,
        description: "Вы можете искажать заклинания по своему усмотрению"
      }
    ]
  },
  "следопыт": {
    name: "Следопыт",
    hitDice: 10,
    primaryAbility: ["dexterity", "wisdom"],
    savingThrows: ["strength", "dexterity"],
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple", "martial"],
    toolProficiencies: [],
    skillChoices: ["animal handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"],
    skillCount: 3,
    spellcasting: {
      ability: "wisdom",
      spellSlots: {
        1: [0, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3]
      }
    },
    features: [
      {
        name: "Избранный враг",
        level: 1,
        description: "Вы получаете преимущество на проверки Мудрости (Выживание) при выслеживании вашего избранного врага"
      },
      {
        name: "Исследователь природы",
        level: 1,
        description: "Вы получаете преимущество на проверки Интеллекта и Мудрости, связанные с вашей избранной местностью"
      },
      {
        name: "Боевой стиль",
        level: 2,
        description: "Вы выбираете специализацию в боевом стиле, например, стрельба или бой двумя оружиями"
      }
    ]
  },
  "монах": {
    name: "Монах",
    hitDice: 8,
    primaryAbility: ["dexterity", "wisdom"],
    savingThrows: ["strength", "dexterity"],
    armorProficiencies: [],
    weaponProficiencies: ["simple", "shortswords"],
    toolProficiencies: ["one type of artisan's tools or one musical instrument"],
    skillChoices: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"],
    skillCount: 2,
    features: [
      {
        name: "Защита без доспехов",
        level: 1,
        description: "Ваш КД равен 10 + модификатор Ловкости + модификатор Мудрости, когда вы не носите доспех или щит"
      },
      {
        name: "Боевые искусства",
        level: 1,
        description: "Вы можете использовать Ловкость вместо Силы для бросков атаки и урона"
      },
      {
        name: "Ки",
        level: 2,
        description: "Вы получаете очки Ки, равные вашему уровню монаха, которые можете тратить на специальные способности"
      }
    ]
  },
  "изобретатель": {
    name: "Изобретатель",
    hitDice: 8,
    primaryAbility: ["intelligence"],
    savingThrows: ["constitution", "intelligence"],
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple"],
    toolProficiencies: ["thieves' tools", "tinker's tools", "one other type of artisan's tools"],
    skillChoices: ["arcana", "history", "investigation", "medicine", "nature", "perception", "sleight of hand"],
    skillCount: 2,
    spellcasting: {
      ability: "intelligence",
      spellSlots: {
        1: [2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2]
      }
    },
    features: [
      {
        name: "Магическое вдохновение",
        level: 1,
        description: "Вы можете использовать инструменты изобретателя для фокусировки магии"
      },
      {
        name: "Магические предметы",
        level: 2,
        description: "Вы можете создавать волшебные предметы, которыми могут пользоваться ваши союзники"
      },
      {
        name: "Специализация изобретателя",
        level: 3,
        description: "Вы выбираете специализацию: Алхимик, Артиллерист или Боевой кузнец"
      }
    ]
  },
  "воин": {
    name: "Воин",
    hitDice: 10,
    primaryAbility: ["strength", "dexterity"],
    savingThrows: ["strength", "constitution"],
    armorProficiencies: ["light", "medium", "heavy", "shields"],
    weaponProficiencies: ["simple", "martial"],
    toolProficiencies: [],
    skillChoices: ["acrobatics", "animal handling", "athletics", "history", "insight", "intimidation", "perception", "survival"],
    skillCount: 2,
    features: [
      {
        name: "Боевой стиль",
        level: 1,
        description: "Вы выбираете специализацию в определённом боевом стиле, получая соответствующий бонус."
      },
      {
        name: "Второе дыхание",
        level: 1,
        description: "Бонусным действием вы можете восстановить хиты, равные 1d10 + уровень воина."
      },
      {
        name: "Всплеск действия",
        level: 2,
        description: "Вы можете один раз совершить одно дополнительное действие в свой ход."
      },
      {
        name: "Воинский архетип",
        level: 3,
        description: "Вы выбираете архетип, который отражает ваш стиль и технику."
      }
    ]
  },
  "варвар": {
    name: "Варвар",
    hitDice: 12,
    primaryAbility: ["strength"],
    savingThrows: ["strength", "constitution"],
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["simple", "martial"],
    toolProficiencies: [],
    skillChoices: ["animal handling", "athletics", "intimidation", "nature", "perception", "survival"],
    skillCount: 2,
    features: [
      {
        name: "Ярость",
        level: 1,
        description: "Бонусным действием вы входите в состояние ярости. В ярости вы получаете преимущество на проверки Силы, бонус урона при использовании Силы для атаки и сопротивление рубящему, колющему и дробящему урону."
      },
      {
        name: "Защита без доспехов",
        level: 1,
        description: "Если вы не носите доспех, ваш КД равен 10 + модификатор Ловкости + модификатор Телосложения."
      },
      {
        name: "Бесстрашный натиск",
        level: 2,
        description: "Вы получаете преимущество на проверки инициативы. Если вы ошеломлены, вы можете действовать обычным образом в свой первы�� ход."
      }
    ]
  },
  "паладин": {
    name: "Паладин",
    hitDice: 10,
    primaryAbility: ["strength", "charisma"],
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["light", "medium", "heavy", "shields"],
    weaponProficiencies: ["simple", "martial"],
    toolProficiencies: [],
    skillChoices: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"],
    skillCount: 2,
    spellcasting: {
      ability: "charisma",
      spellSlots: {
        1: [0, 0, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3]
      }
    },
    features: [
      {
        name: "Божественное чувство",
        level: 1,
        description: "Вы можете определить присутствие сильного зла или добра поблизости."
      },
      {
        name: "Возложение рук",
        level: 1,
        description: "Вы можете восстановить определённое количество хитов касанием руки."
      },
      {
        name: "Боевой стиль",
        level: 2,
        description: "Вы выбираете специализацию в определённом боевом стиле, получая соответствующий бонус."
      }
    ]
  },
  "плут": {
    name: "Плут",
    hitDice: 8,
    primaryAbility: ["dexterity"],
    savingThrows: ["dexterity", "intelligence"],
    armorProficiencies: ["light"],
    weaponProficiencies: ["simple", "hand crossbows", "longswords", "rapiers", "shortswords"],
    toolProficiencies: ["thieves' tools"],
    skillChoices: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleight of hand", "stealth"],
    skillCount: 4,
    features: [
      {
        name: "Компетентность",
        level: 1,
        description: "Вы можете удвоить бонус мастерства для двух навыков, в которых вы мастер."
      },
      {
        name: "Скрытая атака",
        level: 1,
        description: "Вы знаете, как наносить точные удары туда, где цель наиболее уязвима. Один раз в ход вы можете нанести дополнительный урон цели, если имеете преимущество на бросок атаки или если рядом с целью находится ваш союзник."
      },
      {
        name: "Воровской жаргон",
        level: 1,
        description: "Вы знаете тайный язык воров, позволяющий передавать простые сообщения в обычном разговоре."
      }
    ]
  },
  "друид": {
    name: "Друид",
    hitDice: 8,
    primaryAbility: ["wisdom"],
    savingThrows: ["intelligence", "wisdom"],
    armorProficiencies: ["light", "medium", "shields"],
    weaponProficiencies: ["clubs", "daggers", "darts", "javelins", "maces", "quarterstaffs", "scimitars", "sickles", "slings", "spears"],
    toolProficiencies: ["herbalism kit"],
    skillChoices: ["arcana", "animal handling", "insight", "medicine", "nature", "perception", "religion", "survival"],
    skillCount: 2,
    spellcasting: {
      ability: "wisdom",
      spellSlots: {
        1: [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        2: [0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        3: [0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        4: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
        6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
        7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2],
        8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    },
    features: [
      {
        name: "Язык друидов",
        level: 1,
        description: "Вы знаете Друидический, тайный язык друидов."
      },
      {
        name: "Дикий облик",
        level: 2,
        description: "Вы можете использовать действие, чтобы магически превратиться в зверя, которого вы видели раньше."
      }
    ]
  },
  "колдун": {
    name: "Колдун",
    hitDice: 8,
    primaryAbility: ["charisma"],
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["light"],
    weaponProficiencies: ["simple"],
    toolProficiencies: [],
    skillChoices: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"],
    skillCount: 2,
    spellcasting: {
      ability: "charisma",
      spellSlots: {
        1: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
        2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        5: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
        6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "pact": [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4]
      }
    },
    features: [
      {
        name: "Потусторонний покровитель",
        level: 1,
        description: "Вы заключили сделку с могущественным потусторонним существом."
      },
      {
        name: "Таинственные воззвания",
        level: 2,
        description: "Вы получаете доступ к фрагментам запретных знаний, которые наделяют вас постоянной магической способностью."
      }
    ]
  }
};

// Экспортируем данные о классах и вспомогательные функции
export { monkClassData, artificerClassData, rangerClassData, sorcererClassData };

export type ClassName = keyof typeof classData;

// Функция для получения всех классов
export const getAllClasses = () => {
  return Object.values(classData).map((cls) => ({
    name: cls.name,
    description: cls.features?.[0]?.description || "Описание скоро будет добавлено",
    hitDie: `d${cls.hitDice}`,
    primaryAbility: Array.isArray(cls.primaryAbility) ? cls.primaryAbility.join(", ") : cls.primaryAbility,
    savingThrows: Array.isArray(cls.savingThrows) ? cls.savingThrows.join(", ") : cls.savingThrows,
    proficiencies: [
      ...cls.armorProficiencies, 
      ...cls.weaponProficiencies,
      ...cls.toolProficiencies
    ].join(", ")
  }));
};

// Функция для получения деталей конкретного класса
export const getClassDetails = (className: string) => {
  const lowerClassName = className.toLowerCase();
  return classData[lowerClassName as ClassName] || null;
};

// Функция для проверки является ли класс магическим
export const isMagicClass = (className: string) => {
  const lowerClassName = className.toLowerCase();
  return !!classData[lowerClassName as ClassName]?.spellcasting;
};

// Функция для получения списка заклинаний, доступных классу
export const getClassSpells = (className: string) => {
  // Заглушка, в реальном приложении здесь будет логика получения заклинаний
  return [];
};
