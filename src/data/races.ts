
// Базовые расы D&D 5e
export const races = [
  {
    name: "Человек",
    description: "Люди — самая молодая из распространённых рас, поздно пришедшие в мир, определяемый расами более древними, и имеют короткую жизнь по сравнению с дварфами, эльфами и драконами.",
    abilityScoreIncrease: {
      all: 1
    },
    size: "Средний",
    speed: 9,
    languages: ["Общий", "Любой на выбор"],
    traits: ["Универсальность"],
    subraces: []
  },
  {
    name: "Эльф",
    description: "Эльфы — волшебный народ потусторонней грации, живущий в мире, но не полностью являющийся его частью.",
    abilityScoreIncrease: {
      dexterity: 2
    },
    size: "Средний",
    speed: 9,
    languages: ["Общий", "Эльфийский"],
    traits: [
      "Тёмное зрение",
      "Обострённые чувства",
      "Наследие фей",
      "Транс"
    ],
    subraces: [
      {
        name: "Высший эльф",
        description: "Высшие эльфы обладают острым умом и знают, как минимум, основы магии.",
        abilityScoreIncrease: {
          intelligence: 1
        },
        traits: [
          "Эльфийское оружейное обучение",
          "Заговор",
          "Дополнительный язык"
        ]
      },
      {
        name: "Лесной эльф",
        description: "Лесные эльфы предпочитают уединение девственных лесов и других диких земель.",
        abilityScoreIncrease: {
          wisdom: 1
        },
        traits: [
          "Эльфийское оружейное обучение",
          "Быстрые ноги",
          "Маскировка в дикой местности"
        ]
      },
      {
        name: "Тёмный эльф (дроу)",
        description: "Дроу, обитающие в подземном мире, часто злы и жестоки.",
        abilityScoreIncrease: {
          charisma: 1
        },
        traits: [
          "Превосходное тёмное зрение",
          "Чувствительность к солнечному свету",
          "Магия дроу"
        ]
      }
    ]
  },
  {
    name: "Дварф",
    description: "Смелые и выносливые воины из глубинных владений, дварфы известны своей мастеровитостью и храбростью.",
    abilityScoreIncrease: {
      constitution: 2
    },
    size: "Средний",
    speed: 7.5,
    languages: ["Общий", "Дварфский"],
    traits: [
      "Тёмное зрение",
      "Дварфская устойчивость",
      "Дварфская боевая тренировка",
      "Знание камня",
      "Владение инструментами"
    ],
    subraces: [
      {
        name: "Горный дварф",
        description: "Горные дварфы сильны и выносливы, привыкли к суровой жизни в скалистых вершинах.",
        abilityScoreIncrease: {
          strength: 2
        },
        traits: [
          "Тренировка в доспехах",
        ]
      },
      {
        name: "Холмовой дварф",
        description: "Холмовые дварфы более острые на ум, чем их горные сородичи, и известны мудростью, острым чутьём и глубокой интуицией.",
        abilityScoreIncrease: {
          wisdom: 1
        },
        traits: [
          "Дварфская выдержка",
        ]
      }
    ]
  }
];

// Функции для доступа к данным
export function getAllRaces() {
  return races;
}

export function getRaceByName(name: string) {
  return races.find(race => race.name === name) || null;
}

export function getSubracesForRace(raceName: string) {
  const race = getRaceByName(raceName);
  return race?.subraces || [];
}
