import { ClassFeatures } from '@/types/character';

// Исправляем структуру данных
export const classFeatures = [
  {
    name: "Воин",
    hitDice: "1d10",
    primaryAbility: ["Сила", "Телосложение"],
    savingThrowProficiencies: ["Сила", "Телосложение"],
    armorProficiencies: ["Все доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: [],
    skillChoices: ["Атлетика", "Акробатика", "История", "Наблюдательность", "Выживание", "Запугивание"],
    numberOfSkillChoices: 2,
    features: [
      { name: "Второе дыхание", description: "Вы можете действием восстановить хиты, равные 1d10 + уровень воина." },
      { name: "Мастерство доспехов", description: "Если вы носите доспех, вы получаете бонус +1 к КД." }
    ],
    spellcasting: null
  },
  {
    name: "Варвар",
    hitDice: "1d12",
    primaryAbility: ["Сила"],
    savingThrowProficiencies: ["Сила", "Телосложение"],
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: [],
    skillChoices: ["Анимализм", "Атлетика", "Запугивание", "Природа", "Наблюдательность", "Выживание"],
    numberOfSkillChoices: 2,
    features: [
      { name: "Ярость", description: "В бою вы можете впадать в ярость, дающую временные хиты и бонус к урону." },
      { name: "Безрассудная атака", description: "Вы можете совершать атаки с преимуществом, но враги также получают преимущество против вас." }
    ],
    spellcasting: null
  },
  {
    name: "Плут",
    hitDice: "1d8",
    primaryAbility: ["Ловкость"],
    savingThrowProficiencies: ["Ловкость", "Интеллект"],
    armorProficiencies: ["Лёгкие доспехи"],
    weaponProficiencies: ["Простое оружие", "Ручные арбалеты", "Длинные мечи", "Рапиры", "Короткие мечи"],
    toolProficiencies: ["Воровские инструменты"],
    skillChoices: ["Акробатика", "Атлетика", "Обман", "Проницательность", "Запугивание", "Расследование", "Наблюдательность", "Выступление", "Убеждение", "Воровство"],
    numberOfSkillChoices: 4,
    features: [
      { level: 1, name: "Скрытая атака", description: "Вы можете наносить дополнительный урон, если у вас есть преимущество или враг отвлечён." },
      { level: 1, name: "Воровской жаргон", description: "Вы знаете секретный язык, понятный только другим плутам." }
    ],
    spellcasting: null
  },
  {
    name: "Следопыт",
    hitDice: "1d10",
    primaryAbility: ["Ловкость", "Мудрость"],
    savingThrowProficiencies: ["Сила", "Ловкость"],
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: [],
    skillChoices: ["Анимализм", "Атлетика", "Проницательность", "Исследование", "Природа", "Наблюдательность", "Скрытность", "Выживание"],
    numberOfSkillChoices: 3,
    features: [
      { level: 1, name: "Избранный враг", description: "Вы имеете преимущество при отслеживании и вспоминании информации об определённых типах существ." },
      { level: 1, name: "Природный исследователь", description: "Вы отлично ориентируетесь в определённых типах местности." }
    ],
    spellcasting: {
      ability: "Мудрость",
      cantripsKnown: [0],
      spellsKnown: [0],
      spellSlots: {
        "1": [2],
        "2": [3],
        "3": [4, 2],
        "4": [4, 3],
        "5": [4, 3, 2]
      }
    }
  },
  {
    name: "Жрец",
    hitDice: "1d8",
    primaryAbility: ["Мудрость"],
    savingThrowProficiencies: ["Мудрость", "Харизма"],
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие"],
    toolProficiencies: [],
    skillChoices: ["История", "Проницательность", "Медицина", "Убеждение", "Религия"],
    numberOfSkillChoices: 2,
    features: [
      { level: 1, name: "Божественный домен", description: "Вы выбираете домен, связанный с вашим божеством, который даёт вам определённые заклинания и способности." },
      { level: 1, name: "Божественное вмешательство", description: "Вы можете просить своего бога о помощи, но это может не всегда срабатывать." }
    ],
    spellcasting: {
      ability: "Мудрость",
      cantripsKnown: [3, 4, 4, 4, 5],
      spellsKnown: [2, 3, 4, 5, 6],
      spellSlots: {
        "1": [2, 3, 4, 4, 4, 4, 4, 4, 4],
        "2": [0, 2, 3, 3, 3, 3, 3, 3, 3],
        "3": [0, 0, 2, 2, 2, 2, 2, 2, 2],
        "4": [0, 0, 0, 1, 1, 1, 1, 1, 1],
        "5": [0, 0, 0, 0, 1, 1, 1, 1, 1]
      }
    }
  },
  {
    name: "Волшебник",
    hitDice: "1d6",
    primaryAbility: ["Интеллект"],
    savingThrowProficiencies: ["Интеллект", "Мудрость"],
    armorProficiencies: [],
    weaponProficiencies: ["Кинжалы", "Дротики", "Пращи", "Четверть посохи", "Лёгкие арбалеты"],
    toolProficiencies: [],
    skillChoices: ["Магия", "История", "Проницательность", "Медицина", "Убеждение", "Религия"],
    numberOfSkillChoices: 2,
    features: [
      { level: 1, name: "Волшебные традиции", description: "Вы выбираете традицию, которая определяет ваши способности и заклинания." },
      { level: 1, name: "Магическое восстановление", description: "Вы можете восстанавливать некоторые ячейки заклинаний во время короткого отдыха." }
    ],
    spellcasting: {
      ability: "Интеллект",
      cantripsKnown: [3, 4, 4, 4, 5],
      spellsKnown: [2, 3, 4, 5, 6],
      spellSlots: {
        "1": [2, 3, 4, 4, 4, 4, 4, 4, 4],
        "2": [0, 2, 3, 3, 3, 3, 3, 3, 3],
        "3": [0, 0, 2, 2, 2, 2, 2, 2, 2],
        "4": [0, 0, 0, 1, 1, 1, 1, 1, 1],
        "5": [0, 0, 0, 0, 1, 1, 1, 1, 1]
      }
    }
  },
  {
    name: "Друид",
    hitDice: "1d8",
    primaryAbility: ["Мудрость"],
    savingThrowProficiencies: ["Интеллект", "Мудрость"],
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты (друиды не носят доспехи или щиты, сделанные из металла)"],
    weaponProficiencies: ["Дубинки", "Кинжалы", "Дротики", "Пращи", "Короткие мечи", "Серпы", "Копья"],
    toolProficiencies: ["Набор травника"],
    skillChoices: ["Анимализм", "Проницательность", "Медицина", "Природа", "Наблюдательность", "Религия", "Выживание"],
    numberOfSkillChoices: 2,
    features: [
      { level: 1, name: "Друидский", description: "Вы знаете секретный язык друидов." },
      { level: 1, name: "Дикая форма", description: "Вы можете превращаться в животных." }
    ],
    spellcasting: {
      ability: "Мудрость",
      cantripsKnown: [2, 2, 2, 3, 3],
      spellsKnown: [2, 3, 4, 5, 6],
      spellSlots: {
        "1": [2, 3, 4, 4, 4, 4, 4, 4, 4],
        "2": [0, 2, 3, 3, 3, 3, 3, 3, 3],
        "3": [0, 0, 2, 2, 2, 2, 2, 2, 2],
        "4": [0, 0, 0, 1, 1, 1, 1, 1, 1],
        "5": [0, 0, 0, 0, 1, 1, 1, 1, 1]
      }
    }
  },
  {
    name: "Монах",
    hitDice: "1d8",
    primaryAbility: ["Ловкость", "Мудрость"],
    savingThrowProficiencies: ["Сила", "Ловкость"],
    armorProficiencies: [],
    weaponProficiencies: ["Простое оружие", "Короткие мечи"],
    toolProficiencies: ["Вы можете выбрать один тип инструментов или один музыкальный инструмент."],
    skillChoices: ["Акробатика", "Атлетика", "История", "Проницательность", "Религия", "Скрытность"],
    numberOfSkillChoices: 2,
    features: [
      { level: 1, name: "Безоружный бой", description: "Ваши атаки без оружия наносят больше урона." },
      { level: 1, name: "Кхи", description: "Вы можете использовать кхи для выполнения специальных действий." }
    ],
    spellcasting: null
  },
  {
    name: "Паладин",
    hitDice: "1d10",
    primaryAbility: ["Сила", "Харизма"],
    savingThrowProficiencies: ["Мудрость", "Харизма"],
    armorProficiencies: ["Все доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: [],
    skillChoices: ["Атлетика", "Проницательность", "Запугивание", "Медицина", "Убеждение", "Религия"],
    numberOfSkillChoices: 2,
    features: [
      { level: 1, name: "Божественное чутьё", description: "Вы можете чувствовать присутствие нежити и небожителей." },
      { level: 2, name: "Божественная защита", description: "Вы можете добавлять свой модификатор Харизмы к спасброскам." }
    ],
    spellcasting: {
      ability: "Харизма",
      cantripsKnown: [0],
      spellsKnown: [0],
      spellSlots: {
        "1": [2],
        "2": [3],
        "3": [4, 2],
        "4": [4, 3],
        "5": [4, 3, 2]
      }
    }
  },
  {
    name: "Бард",
    hitDice: "1d8",
    primaryAbility: ["Харизма"],
    savingThrowProficiencies: ["Ловкость", "Харизма"],
    armorProficiencies: ["Лёгкие доспехи"],
    weaponProficiencies: ["Простое оружие", "Длинные мечи", "Рапиры", "Короткие мечи", "Ручные арбалеты"],
    toolProficiencies: ["Три музыкальных инструмента на ваш выбор"],
    skillChoices: ["Акробатика", "Атлетика", "Обман", "История", "Проницательность", "Запугивание", "Магия", "Медицина", "Природа", "Наблюдательность", "Выступление", "Убеждение"],
    numberOfSkillChoices: 3,
    features: [
      { level: 1, name: "Вдохновение барда", description: "Вы можете вдохновлять других, давая им бонус к броскам." },
      { level: 1, name: "Бардовское мастерство", description: "Вы можете выбирать различные эффекты для своего вдохновения." }
    ],
    spellcasting: {
      ability: "Харизма",
      cantripsKnown: [2, 2, 2, 3, 3],
      spellsKnown: [2, 3, 4, 5, 6],
      spellSlots: {
        "1": [2, 3, 4, 4, 4, 4, 4, 4, 4],
        "2": [0, 2, 3, 3, 3, 3, 3, 3, 3],
        "3": [0, 0, 2, 2, 2, 2, 2, 2, 2],
        "4": [0, 0, 0, 1, 1, 1, 1, 1, 1],
        "5": [0, 0, 0, 0, 1, 1, 1, 1, 1]
      }
    }
  },
  {
    name: "Колдун",
    hitDice: "1d8",
    primaryAbility: ["Харизма"],
    savingThrowProficiencies: ["Мудрость", "Харизма"],
    armorProficiencies: ["Лёгкие доспехи"],
    weaponProficiencies: ["Простое оружие"],
    toolProficiencies: [],
    skillChoices: ["Обман", "История", "Запугивание", "Расследование", "Природа", "Религия"],
    numberOfSkillChoices: 2,
    features: [
      { level: 1, name: "Потусторонний покровитель", description: "Вы заключаете сделку с могущественным существом, которое даёт вам силы." },
      { level: 1, name: "Мистические воззвания", description: "Вы можете выбирать различные воззвания, усиливающие ваши заклинания и способности." }
    ],
    spellcasting: {
      ability: "Харизма",
      cantripsKnown: [2, 2, 2, 3, 3],
      spellsKnown: [2, 3, 4, 5, 6],
      spellSlots: {
        "1": [2, 3, 4, 4, 4, 4, 4, 4, 4],
        "2": [0, 2, 3, 3, 3, 3, 3, 3, 3],
        "3": [0, 0, 2, 2, 2, 2, 2, 2, 2],
        "4": [0, 0, 0, 1, 1, 1, 1, 1, 1],
        "5": [0, 0, 0, 0, 1, 1, 1, 1, 1]
      }
    }
  }
];

export default classFeatures;
