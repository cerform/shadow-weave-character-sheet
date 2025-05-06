
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
    }
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
    }
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
    }
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
