
/**
 * Данные для класса "Монах" (Monk)
 */

export const monkClassData = {
  name: "Монах",
  englishName: "Monk",
  description: "Монахи - это мастера боевых искусств, совершенствующие свое тело и разум для достижения физического и духовного совершенства.",
  hitDice: "1d8",
  primaryAbility: "DEX",
  secondaryAbility: "WIS",
  savingThrows: ["STR", "DEX"],
  armorProficiencies: [],
  weaponProficiencies: ["Простое оружие", "Короткий меч"],
  toolProficiencies: ["Любой вид ремесленных инструментов или музыкального инструмента (на выбор)"],
  skillChoices: [
    "Акробатика", "Атлетика", "История", "Проницательность", 
    "Религия", "Скрытность"
  ],
  numSkillChoices: 2,
  equipment: [
    ["Короткий меч", "Любое простое оружие"],
    ["Набор исследователя подземелий", "Набор путешественника"],
    "10 дротиков"
  ],
  features: [
    {
      name: "Защита без доспехов",
      level: 1,
      description: "Когда вы не носите ни доспехов, ни щита, ваш Класс Доспеха равен 10 + модификатор Ловкости + модификатор Мудрости."
    },
    {
      name: "Боевые искусства",
      level: 1,
      description: "Ваша практика боевых искусств даёт вам владение боевыми стилями для безоружных ударов и оружия монаха (короткие мечи и простое оружие без свойства «тяжёлое» и «двуручное»)."
    },
    {
      name: "Ци",
      level: 2,
      description: "Ваша тренировка позволяет вам использовать мистическую энергию Ци. Ваш доступ к этой энергии выражен количеством очков Ци, равным вашему уровню монаха."
    },
    {
      name: "Монастырская традиция",
      level: 3,
      description: "Вы выбираете монастырскую традицию: Путь открытой ладони, Путь тени или Путь четырёх стихий."
    },
    {
      name: "Увеличение характеристик",
      level: 4,
      description: "Вы можете повысить один показатель характеристики на 2 или два показателя на 1."
    },
    {
      name: "Замедление падения",
      level: 4,
      description: "Вы можете уменьшить урон от падения, используя реакцию и снижая скорость падения."
    },
    {
      name: "Дополнительная атака",
      level: 5,
      description: "Вы можете атаковать дважды вместо одного раза, когда в свой ход совершаете действие Атака."
    },
    {
      name: "Парирующие удары",
      level: 5,
      description: "Если существо промахивается по вам рукопашной атакой, вы можете потратить 1 очко ци, чтобы совершить рукопашную атаку по этому существу."
    },
    {
      name: "Ци-удар",
      level: 6,
      description: "Ваши безоружные удары считаются магическими для преодоления сопротивления и иммунитета к немагическим атакам."
    }
  ],
  monkFeatures: {
    unarmedStrikeDamage: [
      { level: 1, damage: "1d4" },
      { level: 5, damage: "1d6" },
      { level: 11, damage: "1d8" },
      { level: 17, damage: "1d10" }
    ],
    martialArtsMovement: [
      { level: 1, distance: 0 },
      { level: 2, distance: 10 },
      { level: 6, distance: 15 },
      { level: 10, distance: 20 },
      { level: 14, distance: 25 },
      { level: 18, distance: 30 }
    ],
    kiPoints: [
      { level: 1, points: 0 },
      { level: 2, points: 2 },
      { level: 3, points: 3 },
      { level: 4, points: 4 },
      { level: 5, points: 5 },
      { level: 6, points: 6 },
      { level: 7, points: 7 },
      { level: 8, points: 8 },
      { level: 9, points: 9 },
      { level: 10, points: 10 },
      { level: 11, points: 11 },
      { level: 12, points: 12 },
      { level: 13, points: 13 },
      { level: 14, points: 14 },
      { level: 15, points: 15 },
      { level: 16, points: 16 },
      { level: 17, points: 17 },
      { level: 18, points: 18 },
      { level: 19, points: 19 },
      { level: 20, points: 20 }
    ]
  }
};

export default monkClassData;
