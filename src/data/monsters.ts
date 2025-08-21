// src/data/monsters.ts
import type { Monster } from '@/types/monsters';

export const MONSTERS_DATABASE: Monster[] = [
  // CR 0 - Безвредные существа
  {
    id: 'rat',
    name: 'Крыса',
    nameEn: 'rat',
    size: 'Крошечный',
    type: 'Зверь',
    alignment: 'без мировоззрения',
    armorClass: 10,
    hitPoints: 1,
    hitDice: '1d4-1',
    speed: { walk: 20 },
    abilities: {
      strength: 2,
      dexterity: 11,
      constitution: 9,
      intelligence: 2,
      wisdom: 10,
      charisma: 4
    },
    senses: { 
      darkvision: 30,
      passivePerception: 10 
    },
    languages: [],
    challengeRating: '0',
    experiencePoints: 10,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +0 к попаданию, досягаемость 5 фт., одна цель. Попадание: 1 колющий урон.',
        attackBonus: 0,
        damage: '1',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Городской', 'Подземелье'],
    tokenSize: 0.5
  },
  
  // CR 1/8
  {
    id: 'guard',
    name: 'Стражник',
    nameEn: 'guard',
    size: 'Средний',
    type: 'Гуманоид',
    alignment: 'любое мировоззрение',
    armorClass: 16,
    hitPoints: 11,
    hitDice: '2d8+2',
    speed: { walk: 30 },
    abilities: {
      strength: 13,
      dexterity: 12,
      constitution: 12,
      intelligence: 10,
      wisdom: 11,
      charisma: 10
    },
    skills: { perception: 2 },
    senses: { passivePerception: 12 },
    languages: ['любой один язык (обычно Общий)'],
    challengeRating: '1/8',
    experiencePoints: 25,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Копье',
        description: 'Рукопашная или дальнобойная атака оружием: +3 к попаданию, досягаемость 5 фт. или дистанция 20/60 фт., одна цель. Попадание: 4 (1d6+1) колющего урона, или 5 (1d8+1) колющего урона при использовании двумя руками в рукопашной атаке.',
        attackBonus: 3,
        damage: '1d6+1',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Городской', 'Любой'],
    tokenSize: 1
  },
  
  // CR 1/4
  {
    id: 'wolf',
    name: 'Волк',
    nameEn: 'wolf',
    size: 'Средний',
    type: 'Зверь',
    alignment: 'без мировоззрения',
    armorClass: 13,
    hitPoints: 11,
    hitDice: '2d8+2',
    speed: { walk: 40 },
    abilities: {
      strength: 12,
      dexterity: 15,
      constitution: 12,
      intelligence: 3,
      wisdom: 12,
      charisma: 6
    },
    skills: { perception: 3, stealth: 4 },
    senses: { passivePerception: 13 },
    languages: [],
    challengeRating: '1/4',
    experiencePoints: 50,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острый слух и обоняние',
        description: 'Волк совершает с преимуществом проверки Мудрости (Внимательность), полагающиеся на слух или обоняние.'
      },
      {
        name: 'Тактика стаи',
        description: 'Волк совершает с преимуществом броски атаки по существу, если по крайней мере один союзник волка находится в пределах 5 футов от цели, и этот союзник не недееспособен.'
      }
    ],
    actions: [
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (2d4+2) колющего урона. Если цель — существо, она должна преуспеть в спасброске Силы со Сл 11, иначе будет сбита с ног.',
        attackBonus: 4,
        damage: '2d4+2',
        damageType: 'колющий',
        savingThrow: { ability: 'strength', dc: 11 }
      }
    ],
    source: 'Monster Manual',
    environment: ['Лес', 'Холмы', 'Горы'],
    tokenSize: 1
  },
  
  // CR 1/2
  {
    id: 'orc',
    name: 'Орк',
    nameEn: 'orc',
    size: 'Средний',
    type: 'Гуманоид',
    alignment: 'хаотично-злой',
    armorClass: 13,
    hitPoints: 15,
    hitDice: '2d8+6',
    speed: { walk: 30 },
    abilities: {
      strength: 16,
      dexterity: 12,
      constitution: 16,
      intelligence: 7,
      wisdom: 11,
      charisma: 10
    },
    skills: { intimidation: 2 },
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['Общий', 'Орочий'],
    challengeRating: '1/2',
    experiencePoints: 100,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Агрессивный',
        description: 'Бонусным действием орк может переместиться на расстояние, не превышающее его скорость, в сторону враждебного существа, которое он видит.'
      }
    ],
    actions: [
      {
        name: 'Секира',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 9 (1d12+3) рубящего урона.',
        attackBonus: 5,
        damage: '1d12+3',
        damageType: 'рубящий'
      },
      {
        name: 'Дротик',
        description: 'Дальнобойная атака оружием: +3 к попаданию, дистанция 20/60 фт., одна цель. Попадание: 4 (1d6+1) колющего урона.',
        attackBonus: 3,
        damage: '1d6+1',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Арктика', 'Лес', 'Холмы', 'Горы', 'Болота', 'Подземелье'],
    tokenSize: 1
  },
  
  // CR 1
  {
    id: 'goblin-boss',
    name: 'Гоблин-вожак',
    nameEn: 'goblin-boss',
    size: 'Маленький',
    type: 'Гуманоид',
    alignment: 'нейтрально-злой',
    armorClass: 17,
    hitPoints: 21,
    hitDice: '6d6',
    speed: { walk: 30 },
    abilities: {
      strength: 10,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 10
    },
    skills: { stealth: 6 },
    senses: { 
      darkvision: 60,
      passivePerception: 9 
    },
    languages: ['Гоблинский', 'Общий'],
    challengeRating: '1',
    experiencePoints: 200,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Проворство',
        description: 'Гоблин может совершить действие Рывок или Отход бонусным действием в каждый свой ход.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Гоблин совершает две атаки ятаганом.'
      },
      {
        name: 'Ятаган',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 5 (1d6+2) рубящего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'рубящий'
      },
      {
        name: 'Короткий лук',
        description: 'Дальнобойная атака оружием: +4 к попаданию, дистанция 80/320 фт., одна цель. Попадание: 5 (1d6+2) колющего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Лес', 'Холмы', 'Подземелье'],
    tokenSize: 1
  },
  
  // CR 2
  {
    id: 'ogre',
    name: 'Огр',
    nameEn: 'ogre',
    size: 'Большой',
    type: 'Великан',
    alignment: 'хаотично-злой',
    armorClass: 11,
    hitPoints: 59,
    hitDice: '7d10+21',
    speed: { walk: 40 },
    abilities: {
      strength: 19,
      dexterity: 8,
      constitution: 16,
      intelligence: 5,
      wisdom: 7,
      charisma: 7
    },
    senses: { 
      darkvision: 60,
      passivePerception: 8 
    },
    languages: ['Великанский', 'Общий'],
    challengeRating: '2',
    experiencePoints: 450,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Дубина',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 13 (2d8+4) дробящего урона.',
        attackBonus: 6,
        damage: '2d8+4',
        damageType: 'дробящий'
      },
      {
        name: 'Дротик',
        description: 'Дальнобойная атака оружием: +6 к попаданию, дистанция 30/120 фт., одна цель. Попадание: 11 (2d6+4) колющего урона.',
        attackBonus: 6,
        damage: '2d6+4',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Арктика', 'Лес', 'Холмы', 'Горы', 'Болота'],
    tokenSize: 2
  },
  
  // CR 3
  {
    id: 'owlbear',
    name: 'Совомедведь',
    nameEn: 'owlbear',
    size: 'Большой',
    type: 'Чудовище',
    alignment: 'без мировоззрения',
    armorClass: 13,
    hitPoints: 59,
    hitDice: '7d10+21',
    speed: { walk: 40 },
    abilities: {
      strength: 20,
      dexterity: 12,
      constitution: 17,
      intelligence: 3,
      wisdom: 12,
      charisma: 7
    },
    skills: { perception: 3 },
    senses: { 
      darkvision: 60,
      passivePerception: 13 
    },
    languages: [],
    challengeRating: '3',
    experiencePoints: 700,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острый взгляд и обоняние',
        description: 'Совомедведь совершает с преимуществом проверки Мудрости (Внимательность), полагающиеся на зрение или обоняние.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Совомедведь совершает две атаки: одну клювом и одну когтями.'
      },
      {
        name: 'Клюв',
        description: 'Рукопашная атака оружием: +7 к попаданию, досягаемость 5 фт., одна цель. Попадание: 10 (1d10+5) колющего урона.',
        attackBonus: 7,
        damage: '1d10+5',
        damageType: 'колющий'
      },
      {
        name: 'Когти',
        description: 'Рукопашная атака оружием: +7 к попаданию, досягаемость 5 фт., одна цель. Попадание: 14 (2d8+5) рубящего урона.',
        attackBonus: 7,
        damage: '2d8+5',
        damageType: 'рубящий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Лес'],
    tokenSize: 2
  },
  
  // CR 5 - Более опасные противники
  {
    id: 'troll',
    name: 'Тролль',
    nameEn: 'troll',
    size: 'Большой',
    type: 'Великан',
    alignment: 'хаотично-злой',
    armorClass: 15,
    hitPoints: 84,
    hitDice: '8d12+32',
    speed: { walk: 30 },
    abilities: {
      strength: 18,
      dexterity: 13,
      constitution: 20,
      intelligence: 7,
      wisdom: 9,
      charisma: 7
    },
    skills: { perception: 2 },
    senses: { 
      darkvision: 60,
      passivePerception: 12 
    },
    languages: ['Великанский'],
    challengeRating: '5',
    experiencePoints: 1800,
    proficiencyBonus: 3,
    traits: [
      {
        name: 'Острый нюх',
        description: 'Тролль совершает с преимуществом проверки Мудрости (Внимательность), полагающиеся на обоняние.'
      },
      {
        name: 'Регенерация',
        description: 'Тролль восстанавливает 10 хит-поинтов в начале своего хода. Если тролль получает урон кислотой или огнём, эта черта не работает в начале следующего хода тролля. Тролль умирает, только если начинает ход с 0 хит-поинтов и не регенерирует.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Тролль совершает три атаки: одну укусом и две когтями.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +7 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (1d6+4) колющего урона.',
        attackBonus: 7,
        damage: '1d6+4',
        damageType: 'колющий'
      },
      {
        name: 'Коготь',
        description: 'Рукопашная атака оружием: +7 к попаданию, досягаемость 5 фт., одна цель. Попадание: 11 (2d6+4) рубящего урона.',
        attackBonus: 7,
        damage: '2d6+4',
        damageType: 'рубящий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Болота', 'Горы', 'Подземелье'],
    tokenSize: 2
  },

  // CR 1/4 - Дополнительные монстры
  {
    id: 'goblin',
    name: 'Гоблин',
    nameEn: 'goblin',
    size: 'Маленький',
    type: 'Гуманоид',
    alignment: 'нейтрально-злой',
    armorClass: 15,
    hitPoints: 7,
    hitDice: '2d6',
    speed: { walk: 30 },
    abilities: {
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8
    },
    skills: { stealth: 6 },
    senses: { 
      darkvision: 60,
      passivePerception: 9 
    },
    languages: ['Общий', 'Гоблинский'],
    challengeRating: '1/4',
    experiencePoints: 50,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Проворство',
        description: 'Гоблин может совершить действие Рывок или Отход бонусным действием в каждый свой ход.'
      }
    ],
    actions: [
      {
        name: 'Ятаган',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 5 (1d6+2) рубящего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'рубящий'
      },
      {
        name: 'Короткий лук',
        description: 'Дальнобойная атака оружием: +4 к попаданию, дистанция 80/320 фт., одна цель. Попадание: 5 (1d6+2) колющего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Леса', 'Холмы', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'skeleton',
    name: 'Скелет',
    nameEn: 'skeleton',
    size: 'Средний',
    type: 'Нежить',
    alignment: 'законно-злой',
    armorClass: 13,
    hitPoints: 13,
    hitDice: '2d8+2',
    speed: { walk: 30 },
    abilities: {
      strength: 10,
      dexterity: 14,
      constitution: 15,
      intelligence: 6,
      wisdom: 8,
      charisma: 5
    },
    damageVulnerabilities: ['дробящий'],
    damageImmunities: ['яд'],
    conditionImmunities: ['истощение', 'отравление'],
    senses: { 
      darkvision: 60,
      passivePerception: 9 
    },
    languages: ['понимает все языки, которые знал при жизни, но не может говорить'],
    challengeRating: '1/4',
    experiencePoints: 50,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Короткий меч',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 5 (1d6+2) колющего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'колющий'
      },
      {
        name: 'Короткий лук',
        description: 'Дальнобойная атака оружием: +4 к попаданию, дистанция 80/320 фт., одна цель. Попадание: 5 (1d6+2) колющего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Подземелье', 'Болота'],
    tokenSize: 1
  },

  // CR 1/2 - Дополнительные монстры
  {
    id: 'beauty',
    name: 'Краса',
    nameEn: 'dryad',
    size: 'Средний',
    type: 'Фея',
    alignment: 'нейтральный',
    armorClass: 11,
    hitPoints: 22,
    hitDice: '5d8',
    speed: { walk: 30 },
    abilities: {
      strength: 10,
      dexterity: 12,
      constitution: 11,
      intelligence: 14,
      wisdom: 15,
      charisma: 18
    },
    skills: { 
      perception: 4, 
      stealth: 5 
    },
    senses: { 
      darkvision: 60,
      passivePerception: 14 
    },
    languages: ['Эльфийский', 'Сильван'],
    challengeRating: '1/2',
    experiencePoints: 100,
    proficiencyBonus: 2,
    spellcasting: {
      level: 4,
      ability: 'Харизма',
      saveDC: 14,
      spells: {
        0: ['Друидизм'],
        1: ['Запутывание', 'Добрые ягоды'],
        2: ['Лунный луч', 'Шипы']
      }
    },
    traits: [
      {
        name: 'Слияние с деревом',
        description: 'Дриада может магически войти в дерево и выйти из другого дерева того же вида в пределах 60 футов.'
      }
    ],
    actions: [
      {
        name: 'Дубинка',
        description: 'Рукопашная атака оружием: +2 к попаданию, досягаемость 5 фт., одна цель. Попадание: 2 (1d4) дробящего урона плюс 2 (1d4) яда.',
        attackBonus: 2,
        damage: '1d4',
        damageType: 'дробящий'
      },
      {
        name: 'Очарование',
        description: 'Дриада нацеливается на одного гуманоида или зверя в пределах 30 футов. Цель должна преуспеть в спасброске Мудрости Сл 14 или быть очарованной на 1 день.'
      }
    ],
    source: 'Monster Manual',
    environment: ['Леса'],
    tokenSize: 1
  },

  {
    id: 'black-bear',
    name: 'Чёрный медведь',
    nameEn: 'black bear',
    size: 'Средний',
    type: 'Зверь',
    alignment: 'без мировоззрения',
    armorClass: 11,
    hitPoints: 19,
    hitDice: '3d8+3',
    speed: { walk: 40, climb: 30 },
    abilities: {
      strength: 15,
      dexterity: 10,
      constitution: 13,
      intelligence: 2,
      wisdom: 12,
      charisma: 7
    },
    skills: { perception: 3 },
    senses: { 
      passivePerception: 13 
    },
    languages: [],
    challengeRating: '1/2',
    experiencePoints: 100,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острое обоняние',
        description: 'Медведь совершает с преимуществом проверки Мудрости (Восприятие), полагающиеся на обоняние.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Медведь совершает две атаки: одну укусом и одну когтями.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 5 (1d6+2) колющего урона.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'колющий'
      },
      {
        name: 'Когти',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (2d4+2) рубящего урона.',
        attackBonus: 4,
        damage: '2d4+2',
        damageType: 'рубящий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Леса', 'Холмы'],
    tokenSize: 1
  },

  // CR 1 - Дополнительные монстры
  {
    id: 'dire-wolf',
    name: 'Лютый волк',
    nameEn: 'dire wolf',
    size: 'Большой',
    type: 'Зверь',
    alignment: 'без мировоззрения',
    armorClass: 14,
    hitPoints: 37,
    hitDice: '5d10+10',
    speed: { walk: 50 },
    abilities: {
      strength: 17,
      dexterity: 15,
      constitution: 15,
      intelligence: 3,
      wisdom: 12,
      charisma: 7
    },
    skills: { 
      perception: 3, 
      stealth: 4 
    },
    senses: { 
      passivePerception: 13 
    },
    languages: [],
    challengeRating: '1',
    experiencePoints: 200,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острый слух и обоняние',
        description: 'Волк совершает с преимуществом проверки Мудрости (Восприятие), полагающиеся на слух или обоняние.'
      },
      {
        name: 'Тактика стаи',
        description: 'Волк совершает с преимуществом броски атаки по существу, если в пределах 5 футов от этого существа находится как минимум один дееспособный союзник волка.'
      }
    ],
    actions: [
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 10 (2d6+3) колющего урона. Если цель — существо, она должна преуспеть в спасброске Силы Сл 13, иначе будет сбита с ног.',
        attackBonus: 5,
        damage: '2d6+3',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Леса', 'Холмы'],
    tokenSize: 2
  },

  {
    id: 'brown-bear',
    name: 'Бурый медведь',
    nameEn: 'brown bear',
    size: 'Большой',
    type: 'Зверь',  
    alignment: 'без мировоззрения',
    armorClass: 11,
    hitPoints: 34,
    hitDice: '4d10+8',
    speed: { walk: 40, climb: 30 },
    abilities: {
      strength: 19,
      dexterity: 10,
      constitution: 16,
      intelligence: 2,
      wisdom: 13,
      charisma: 7
    },
    skills: { perception: 3 },
    senses: { 
      passivePerception: 13 
    },
    languages: [],
    challengeRating: '1',
    experiencePoints: 200,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острое обоняние',
        description: 'Медведь совершает с преимуществом проверки Мудрости (Восприятие), полагающиеся на обоняние.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Медведь совершает две атаки: одну укусом и одну когтями.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 8 (1d8+4) колющего урона.',
        attackBonus: 6,
        damage: '1d8+4',
        damageType: 'колющий'
      },
      {
        name: 'Когти',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 11 (2d6+4) рубящего урона.',
        attackBonus: 6,
        damage: '2d6+4',
        damageType: 'рубящий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Леса', 'Холмы'],
    tokenSize: 2
  },

  // CR 2 - Дополнительные монстры
  {
    id: 'zombie',
    name: 'Зомби',
    nameEn: 'zombie',
    size: 'Средний',
    type: 'Нежить',
    alignment: 'нейтрально-злой',
    armorClass: 8,
    hitPoints: 22,
    hitDice: '3d8+6',
    speed: { walk: 20 },
    abilities: {
      strength: 13,
      dexterity: 6,
      constitution: 16,
      intelligence: 3,
      wisdom: 6,
      charisma: 5
    },
    savingThrows: { wisdom: 0 },
    damageImmunities: ['яд'],
    conditionImmunities: ['отравление'],
    senses: { 
      darkvision: 60,
      passivePerception: 8 
    },
    languages: ['понимает языки, которые знал при жизни, но не может говорить'],
    challengeRating: '1/4',
    experiencePoints: 50,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Нежить. Стойкость',
        description: 'Если урон снижает здоровье зомби до 0, он должен совершить спасбросок Телосложения, Сл которого равна 5 + полученный урон. При успехе зомби вместо этого снижает количество хитов до 1.'
      }
    ],
    actions: [
      {
        name: 'Удар',
        description: 'Рукопашная атака оружием: +3 к попаданию, досягаемость 5 фт., одна цель. Попадание: 4 (1d6+1) дробящего урона.',
        attackBonus: 3,
        damage: '1d6+1',
        damageType: 'дробящий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Подземелье', 'Болота'],
    tokenSize: 1
  },

  {
    id: 'lion',
    name: 'Лев',
    nameEn: 'lion',
    size: 'Большой',
    type: 'Зверь',
    alignment: 'без мировоззрения',
    armorClass: 12,
    hitPoints: 26,
    hitDice: '4d10+4',
    speed: { walk: 50 },
    abilities: {
      strength: 17,
      dexterity: 15,
      constitution: 13,
      intelligence: 3,
      wisdom: 12,
      charisma: 8
    },
    skills: { 
      perception: 3, 
      stealth: 6 
    },
    senses: { 
      passivePerception: 13 
    },
    languages: [],
    challengeRating: '1',
    experiencePoints: 200,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острое обоняние',
        description: 'Лев совершает с преимуществом проверки Мудрости (Восприятие), полагающиеся на обоняние.'
      },
      {
        name: 'Тактика стаи',
        description: 'Лев совершает с преимуществом броски атаки по существу, если в пределах 5 футов от этого существа находится как минимум один дееспособный союзник льва.'
      },
      {
        name: 'Прыжок с разбега',
        description: 'Если лев перемещается как минимум на 20 футов по прямой к существу, а затем попадает по нему атакой когтями в том же ходу, цель должна преуспеть в спасброске Силы Сл 13, иначе будет сбита с ног.'
      }
    ],
    actions: [
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (1d8+3) колющего урона.',
        attackBonus: 5,
        damage: '1d8+3',
        damageType: 'колющий'
      },
      {
        name: 'Когти',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 6 (1d6+3) рубящего урона.',
        attackBonus: 5,
        damage: '1d6+3',
        damageType: 'рубящий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Луга', 'Холмы'],
    tokenSize: 2
  },

  // CR 3 - Новые монстры
  {
    id: 'bugbear',
    name: 'Медвежатник',
    nameEn: 'bugbear',
    size: 'Средний',
    type: 'Гуманоид',
    alignment: 'хаотично-злой',
    armorClass: 16,
    hitPoints: 27,
    hitDice: '5d8+5',
    speed: { walk: 30 },
    abilities: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 8,
      wisdom: 11,
      charisma: 9
    },
    skills: { 
      stealth: 6, 
      survival: 2 
    },
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['Общий', 'Гоблинский'],
    challengeRating: '1',
    experiencePoints: 200,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Грубая сила',
        description: 'Рукопашная атака оружием наносит дополнительные 4 (1d8) урона, когда медвежатник попадает по удивлённой цели.'
      },
      {
        name: 'Скрытность',
        description: 'Медвежатник может попытаться спрятаться, когда лишь слегка заслонён существом, которое как минимум на один размер больше его.'
      }
    ],
    actions: [
      {
        name: 'Моргенштерн',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 11 (2d8+2) колющего урона.',
        attackBonus: 4,
        damage: '2d8+2',
        damageType: 'колющий'
      },
      {
        name: 'Дротик',
        description: 'Дальнобойная атака оружием: +4 к попаданию, дистанция 20/60 фт., одна цель. Попадание: 4 (1d4+2) колющего урона.',
        attackBonus: 4,
        damage: '1d4+2',
        damageType: 'колющий'
      }
    ],
    source: 'Monster Manual',
    environment: ['Леса', 'Холмы', 'Подземелье'],
    tokenSize: 1
  },

  // Дополнительные монстры из списка пользователя
  {
    id: 'darz-helgar',
    name: 'Дарз Хелгар',
    nameEn: 'Darz Helgar',
    size: 'Средний',
    type: 'Гуманоид',
    alignment: 'любое мировоззрение',
    armorClass: 12,
    hitPoints: 9,
    hitDice: '2d8',
    speed: { walk: 30 },
    abilities: {
      strength: 11,
      dexterity: 12,
      constitution: 11,
      intelligence: 12,
      wisdom: 14,
      charisma: 16
    },
    senses: { passivePerception: 12 },
    languages: ['Общий'],
    challengeRating: '1/4',
    experiencePoints: 50,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Дротик',
        description: 'Дальнобойная атака оружием: +3 к попаданию, дистанция 20/60 фт., одна цель. Попадание: 4 (1d6+1) колющего урона.',
        attackBonus: 3,
        damage: '1d6+1',
        damageType: 'колющий'
      }
    ],
    source: 'Basic',
    environment: ['Городской'],
    tokenSize: 1
  },

  {
    id: 'draconic-companion',
    name: 'Драконий компаньон',
    nameEn: 'Draconic Companion',
    size: 'Средний',
    type: 'Дракон',
    alignment: 'нейтральное',
    armorClass: 13,
    hitPoints: 26,
    hitDice: '4d8+8',
    speed: { walk: 30, fly: 60 },
    abilities: {
      strength: 14,
      dexterity: 14,
      constitution: 15,
      intelligence: 8,
      wisdom: 13,
      charisma: 12
    },
    senses: { 
      darkvision: 60,
      passivePerception: 11 
    },
    languages: ['Драконий'],
    challengeRating: '1',
    experiencePoints: 200,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +4 к попаданию, досягаемость 5 фт., одна цель. Попадание: 6 (1d8+2) колющего урона.',
        attackBonus: 4,
        damage: '1d8+2',
        damageType: 'колющий'
      }
    ],
    source: 'HB',
    environment: ['Горы', 'Пещеры'],
    tokenSize: 1
  },

  {
    id: 'drake-companion',
    name: 'Дрейк Компаньон',
    nameEn: 'Drake Companion',
    size: 'Средний',
    type: 'Дракон',
    alignment: 'нейтральное',
    armorClass: 14,
    hitPoints: 30,
    hitDice: '4d8+12',
    speed: { walk: 40 },
    abilities: {
      strength: 16,
      dexterity: 12,
      constitution: 16,
      intelligence: 8,
      wisdom: 13,
      charisma: 10
    },
    senses: { 
      darkvision: 60,
      passivePerception: 11 
    },
    languages: ['Драконий'],
    challengeRating: '2',
    experiencePoints: 450,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (1d8+3) колющего урона.',
        attackBonus: 5,
        damage: '1d8+3',
        damageType: 'колющий'
      }
    ],
    source: 'Basic',
    environment: ['Горы', 'Пустыни'],
    tokenSize: 1
  },

  {
    id: 'geist',
    name: 'Дух',
    nameEn: 'Geist',
    size: 'Средний',
    type: 'Нежить',
    alignment: 'хаотично-злое',
    armorClass: 11,
    hitPoints: 22,
    hitDice: '5d8',
    speed: { walk: 0, fly: 40 },
    abilities: {
      strength: 7,
      dexterity: 13,
      constitution: 10,
      intelligence: 10,
      wisdom: 12,
      charisma: 17
    },
    damageResistances: ['некротический', 'холод'],
    damageImmunities: ['яд'],
    conditionImmunities: ['отравленное', 'очарованное', 'изнурение'],
    senses: { 
      darkvision: 60,
      passivePerception: 11 
    },
    languages: ['языки, которые знал при жизни'],
    challengeRating: '4',
    experiencePoints: 1100,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Бестелесное перемещение',
        description: 'Дух может перемещаться через других существ и объекты, как если бы они были труднопроходимой местностью.'
      }
    ],
    actions: [
      {
        name: 'Иссушающее касание',
        description: 'Рукопашная атака заклинанием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 17 (4d6+3) некротического урона.',
        attackBonus: 6,
        damage: '4d6+3',
        damageType: 'некротический'
      }
    ],
    source: 'HB',
    environment: ['Кладбища', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'aberrant-spirit',
    name: 'Дух Аберрации',
    nameEn: 'Aberrant Spirit',
    size: 'Средний',
    type: 'Аберрация',
    alignment: 'нейтральное',
    armorClass: 11,
    hitPoints: 40,
    hitDice: '6d8+12',
    speed: { walk: 30, fly: 40 },
    abilities: {
      strength: 16,
      dexterity: 10,
      constitution: 15,
      intelligence: 16,
      wisdom: 10,
      charisma: 6
    },
    damageImmunities: ['психический'],
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['Бездны', 'телепатия 60 фт.'],
    challengeRating: '4',
    experiencePoints: 1100,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Мультиатака',
        description: 'Дух совершает две атаки псевдоподами.'
      },
      {
        name: 'Псевдопод',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 8 (1d8+4) дробящего урона плюс 3 (1d6) психического урона.',
        attackBonus: 6,
        damage: '1d8+4',
        damageType: 'дробящий',
        additionalDamage: '1d6',
        additionalDamageType: 'психический'
      }
    ],
    source: 'Basic',
    environment: ['Дальние планы', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'warrior-spirit',
    name: 'Дух воителя',
    nameEn: 'Warrior Spirit',
    size: 'Средний',
    type: 'Нежить',
    alignment: 'нейтральное',
    armorClass: 15,
    hitPoints: 58,
    hitDice: '9d8+18',
    speed: { walk: 30, fly: 50 },
    abilities: {
      strength: 16,
      dexterity: 16,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 10
    },
    damageResistances: ['некротический'],
    damageImmunities: ['яд'],
    conditionImmunities: ['отравленное', 'очарованное', 'изнурение'],
    senses: { 
      darkvision: 60,
      passivePerception: 11 
    },
    languages: ['языки, которые знал при жизни'],
    challengeRating: '5',
    experiencePoints: 1800,
    proficiencyBonus: 3,
    actions: [
      {
        name: 'Мультиатака',
        description: 'Дух совершает две атаки оружием.'
      },
      {
        name: 'Духовное оружие',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (1d8+3) силового урона.',
        attackBonus: 6,
        damage: '1d8+3',
        damageType: 'силовой'
      }
    ],
    source: 'UA',
    environment: ['Кладбища', 'Поля битв'],
    tokenSize: 1
  },

  {
    id: 'wildfire-spirit',
    name: 'Дух дикого огня',
    nameEn: 'Wildfire Spirit',
    size: 'Маленький',
    type: 'Элементаль',
    alignment: 'нейтральное',
    armorClass: 13,
    hitPoints: 42,
    hitDice: '12d6',
    speed: { walk: 30, fly: 60 },
    abilities: {
      strength: 10,
      dexterity: 14,
      constitution: 10,
      intelligence: 13,
      wisdom: 15,
      charisma: 11
    },
    damageImmunities: ['огонь'],
    senses: { 
      darkvision: 60,
      passivePerception: 12 
    },
    languages: ['понимает языки создателя, но не говорит'],
    challengeRating: '3',
    experiencePoints: 700,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Огненный разряд',
        description: 'Дальнобойная атака заклинанием: +5 к попаданию, дистанция 60 фт., одна цель. Попадание: 7 (1d8+3) огненного урона.',
        attackBonus: 5,
        damage: '1d8+3',
        damageType: 'огонь'
      }
    ],
    source: 'Basic',
    environment: ['Леса', 'Поля'],
    tokenSize: 0.5
  },

  {
    id: 'draconic-spirit',
    name: 'Дух дракона',
    nameEn: 'Draconic Spirit',
    size: 'Большой',
    type: 'Дракон',
    alignment: 'нейтральное',
    armorClass: 14,
    hitPoints: 50,
    hitDice: '6d10+18',
    speed: { walk: 30, fly: 60, swim: 30 },
    abilities: {
      strength: 19,
      dexterity: 14,
      constitution: 17,
      intelligence: 10,
      wisdom: 14,
      charisma: 14
    },
    damageResistances: ['огонь', 'холод', 'кислота', 'молния', 'яд'],
    senses: { 
      blindsight: 30,
      darkvision: 60,
      passivePerception: 12 
    },
    languages: ['Драконий', 'понимает языки создателя'],
    challengeRating: '4',
    experiencePoints: 1100,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Мультиатака',
        description: 'Дух совершает две атаки: одну укусом и одну когтем.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 8 (1d10+3) колющего урона плюс 4 (1d8) урона от стихии.',
        attackBonus: 6,
        damage: '1d10+3',
        damageType: 'колющий',
        additionalDamage: '1d8',
        additionalDamageType: 'стихийный'
      }
    ],
    source: 'Basic',
    environment: ['Горы', 'Пещеры'],
    tokenSize: 2
  },

  {
    id: 'reaper-spirit',
    name: 'Дух жнеца',
    nameEn: 'Reaper Spirit',
    size: 'Средний',
    type: 'Нежить',
    alignment: 'нейтрально-злое',
    armorClass: 15,
    hitPoints: 67,
    hitDice: '9d8+27',
    speed: { walk: 30, fly: 60 },
    abilities: {
      strength: 14,
      dexterity: 16,
      constitution: 16,
      intelligence: 10,
      wisdom: 15,
      charisma: 16
    },
    damageResistances: ['некротический', 'холод'],
    damageImmunities: ['яд'],
    conditionImmunities: ['отравленное', 'очарованное', 'изнурение'],
    senses: { 
      darkvision: 120,
      passivePerception: 12 
    },
    languages: ['понимает все языки, но не говорит'],
    challengeRating: '5',
    experiencePoints: 1800,
    proficiencyBonus: 3,
    traits: [
      {
        name: 'Жатва душ',
        description: 'Когда существо умирает в пределах 30 футов от духа, дух восстанавливает 5 хит-поинтов.'
      }
    ],
    actions: [
      {
        name: 'Коса смерти',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 10 фт., одна цель. Попадание: 9 (2d6+2) рубящего урона плюс 7 (2d6) некротического урона.',
        attackBonus: 6,
        damage: '2d6+2',
        damageType: 'рубящий',
        additionalDamage: '2d6',
        additionalDamageType: 'некротический'
      }
    ],
    source: 'Basic',
    environment: ['Кладбища', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'bestial-spirit',
    name: 'Дух Зверя',
    nameEn: 'Bestial Spirit',
    size: 'Средний',
    type: 'Зверь',
    alignment: 'нейтральное',
    armorClass: 11,
    hitPoints: 30,
    hitDice: '4d8+12',
    speed: { walk: 30, climb: 30, swim: 30 },
    abilities: {
      strength: 18,
      dexterity: 11,
      constitution: 16,
      intelligence: 4,
      wisdom: 14,
      charisma: 5
    },
    senses: { 
      darkvision: 60,
      passivePerception: 12 
    },
    languages: ['понимает языки создателя, но не говорит'],
    challengeRating: '2',
    experiencePoints: 450,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Острые чувства',
        description: 'Дух совершает с преимуществом проверки Мудрости (Внимательность), основанные на обонянии или слухе.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Дух совершает две атаки: одну укусом и одну когтем.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 8 (1d8+4) колющего урона.',
        attackBonus: 6,
        damage: '1d8+4',
        damageType: 'колющий'
      }
    ],
    source: 'Basic',
    environment: ['Леса', 'Горы'],
    tokenSize: 1
  },

  {
    id: 'molydeus-mpmm',
    name: 'Молидей',
    nameEn: 'Molydeus MPMM',
    size: 'Огромный',
    type: 'Исчадие',
    alignment: 'хаотично-злое',
    armorClass: 19,
    hitPoints: 216,
    hitDice: '16d12+112',
    speed: { walk: 40 },
    abilities: {
      strength: 28,
      dexterity: 22,
      constitution: 25,
      intelligence: 21,
      wisdom: 24,
      charisma: 24
    },
    savingThrows: {
      strength: 16,
      constitution: 14,
      wisdom: 14,
      charisma: 14
    },
    skills: { perception: 21 },
    damageResistances: ['холод', 'огонь', 'молния', 'дробящий, колющий и рубящий урон от немагических атак'],
    damageImmunities: ['яд'],
    conditionImmunities: ['отравленное'],
    senses: { 
      truesight: 120,
      passivePerception: 31 
    },
    languages: ['Бездны', 'телепатия 120 фт.'],
    challengeRating: '21',
    experiencePoints: 33000,
    proficiencyBonus: 7,
    legendaryActionsPerTurn: 3,
    traits: [
      {
        name: 'Магическое сопротивление',
        description: 'Молидей совершает с преимуществом спасброски от заклинаний и других магических эффектов.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Молидей совершает три атаки: одну укусом, одну когтем и одну оружием.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +16 к попаданию, досягаемость 5 фт., одна цель. Попадание: 22 (2d12+9) колющего урона.',
        attackBonus: 16,
        damage: '2d12+9',
        damageType: 'колющий'
      }
    ],
    source: 'Basic',
    environment: ['Бездна'],
    tokenSize: 3
  },

  {
    id: 'asmodeus',
    name: 'Асмодей',
    nameEn: 'Asmodeus',
    size: 'Большой',
    type: 'Исчадие',
    alignment: 'законно-злое',
    armorClass: 22,
    hitPoints: 696,
    hitDice: '48d12+384',
    speed: { walk: 40, fly: 80 },
    abilities: {
      strength: 30,
      dexterity: 16,
      constitution: 26,
      intelligence: 26,
      wisdom: 21,
      charisma: 30
    },
    savingThrows: {
      dexterity: 11,
      constitution: 16,
      wisdom: 13
    },
    skills: { 
      deception: 26,
      insight: 13,
      intimidation: 26,
      perception: 13
    },
    damageResistances: ['холод', 'дробящий, колющий и рубящий урон от немагических атак, не сделанных серебряным оружием'],
    damageImmunities: ['огонь', 'яд'],
    conditionImmunities: ['очарованное', 'изнурение', 'испуганное', 'отравленное'],
    senses: { 
      truesight: 120,
      passivePerception: 23 
    },
    languages: ['Все', 'телепатия 120 фт.'],
    challengeRating: '30',
    experiencePoints: 155000,
    proficiencyBonus: 9,
    legendaryActionsPerTurn: 3,
    traits: [
      {
        name: 'Легендарное сопротивление (3/день)',
        description: 'Если Асмодей проваливает спасбросок, он может вместо этого преуспеть в нём.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Асмодей совершает одну атаку рубиновым жезлом и использует Адское слово.'
      },
      {
        name: 'Рубиновый жезл',
        description: 'Рукопашная атака оружием: +19 к попаданию, досягаемость 10 фт., одна цель. Попадание: 20 (2d8+10) дробящего урона плюс 16 (3d10) некротического урона.',
        attackBonus: 19,
        damage: '2d8+10',
        damageType: 'дробящий',
        additionalDamage: '3d10',
        additionalDamageType: 'некротический'
      }
    ],
    source: 'HB',
    environment: ['Девять Преисподних'],
    tokenSize: 2
  },

  {
    id: 'tiamat',
    name: 'Тиамат',
    nameEn: 'Tiamat',
    size: 'Исполинский',
    type: 'Исчадие',
    alignment: 'хаотично-злое',
    armorClass: 25,
    hitPoints: 615,
    hitDice: '30d20+300',
    speed: { walk: 60, fly: 120 },
    abilities: {
      strength: 30,
      dexterity: 10,
      constitution: 30,
      intelligence: 26,
      wisdom: 26,
      charisma: 28
    },
    savingThrows: {
      strength: 19,
      dexterity: 9,
      wisdom: 17
    },
    skills: { 
      arcana: 17,
      perception: 26,
      religion: 17
    },
    damageResistances: ['дробящий, колющий и рубящий урон от немагических атак'],
    damageImmunities: ['кислота', 'холод', 'огонь', 'молния', 'яд'],
    conditionImmunities: ['ослеплённое', 'очарованное', 'оглушённое', 'испуганное', 'отравленное', 'сбитое с ног'],
    senses: { 
      darkvision: 240,
      truesight: 120,
      passivePerception: 36 
    },
    languages: ['Общий', 'Драконий', 'Адский'],
    challengeRating: '30',
    experiencePoints: 155000,
    proficiencyBonus: 9,
    legendaryActionsPerTurn: 5,
    traits: [
      {
        name: 'Легендарное сопротивление (5/день)',
        description: 'Если Тиамат проваливает спасбросок, она может вместо этого преуспеть в нём.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Тиамат может использовать Ужасающее присутствие. Затем она совершает пять атак: одну каждой головой.'
      },
      {
        name: 'Укус (Красная голова)',
        description: 'Рукопашная атака оружием: +19 к попаданию, досягаемость 20 фт., одна цель. Попадание: 24 (2d12+10) колющего урона плюс 14 (4d6) огненного урона.',
        attackBonus: 19,
        damage: '2d12+10',
        damageType: 'колющий',
        additionalDamage: '4d6',
        additionalDamageType: 'огонь'
      }
    ],
    source: 'Basic',
    environment: ['Девять Преисподних', 'Бездна'],
    tokenSize: 4
  },

  {
    id: 'tarrasque',
    name: 'Тараск',
    nameEn: 'Tarrasque',
    size: 'Исполинский',
    type: 'Монстр',
    alignment: 'без мировоззрения',
    armorClass: 25,
    hitPoints: 676,
    hitDice: '33d20+330',
    speed: { walk: 40 },
    abilities: {
      strength: 30,
      dexterity: 11,
      constitution: 30,
      intelligence: 3,
      wisdom: 11,
      charisma: 11
    },
    savingThrows: {
      intelligence: 5,
      wisdom: 9,
      charisma: 9
    },
    damageImmunities: ['огонь', 'яд', 'дробящий, колющий и рубящий урон от немагических атак'],
    conditionImmunities: ['очарованное', 'испуганное', 'паралич', 'отравленное'],
    senses: { 
      blindsight: 120,
      passivePerception: 10 
    },
    languages: [],
    challengeRating: '30',
    experiencePoints: 155000,
    proficiencyBonus: 9,
    traits: [
      {
        name: 'Легендарное сопротивление (3/день)',
        description: 'Если тараск проваливает спасбросок, он может вместо этого преуспеть в нём.'
      },
      {
        name: 'Отражающий панцирь',
        description: 'Любое время, когда тараск становится целью заклинания магическая стрела, линейного заклинания или заклинания, требующего дальнобойную атаку, бросьте d6. При результате 1-5 тараск не получает урон и эффект отражается обратно в заклинателя.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Тараск может использовать Ужасающее присутствие. Затем он совершает пять атак: одну укусом, две когтями, одну рогами и одну хвостом.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +19 к попаданию, досягаемость 10 фт., одна цель. Попадание: 36 (4d12+10) колющего урона.',
        attackBonus: 19,
        damage: '4d12+10',
        damageType: 'колющий'
      }
    ],
    source: 'Basic',
    environment: ['Любой'],
    tokenSize: 4
  },

  {
    id: 'fiendish-spirit',
    name: 'Дух Исчадия',
    nameEn: 'Fiendish Spirit',
    size: 'Большой',
    type: 'Исчадие',
    alignment: 'нейтрально-злое',
    armorClass: 13,
    hitPoints: 50,
    hitDice: '6d10+18',
    speed: { walk: 40, fly: 60 },
    abilities: {
      strength: 13,
      dexterity: 16,
      constitution: 17,
      intelligence: 10,
      wisdom: 10,
      charisma: 16
    },
    damageResistances: ['огонь'],
    damageImmunities: ['некротический', 'яд'],
    conditionImmunities: ['отравленное'],
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['Бездны', 'понимает языки создателя'],
    challengeRating: '6',
    experiencePoints: 2300,
    proficiencyBonus: 3,
    actions: [
      {
        name: 'Мультиатака',
        description: 'Дух совершает две атаки: одну укусом и одну когтем.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 12 (2d8+3) колющего урона.',
        attackBonus: 6,
        damage: '2d8+3',
        damageType: 'колющий'
      }
    ],
    source: 'Basic',
    environment: ['Нижние планы'],
    tokenSize: 2
  },

  {
    id: 'construct-spirit',
    name: 'Дух конструкта',
    nameEn: 'Construct Spirit',
    size: 'Средний',
    type: 'Конструкт',
    alignment: 'нейтральное',
    armorClass: 15,
    hitPoints: 40,
    hitDice: '6d8+12',
    speed: { walk: 30 },
    abilities: {
      strength: 18,
      dexterity: 10,
      constitution: 14,
      intelligence: 14,
      wisdom: 11,
      charisma: 5
    },
    damageImmunities: ['яд', 'психический'],
    conditionImmunities: ['очарованное', 'изнурение', 'испуганное', 'паралич', 'отравленное', 'окаменение'],
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['понимает языки создателя, но не говорит'],
    challengeRating: '4',
    experiencePoints: 1100,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Неутомимость',
        description: 'Дух не нуждается в воздухе, еде, питье или сне.'
      }
    ],
    actions: [
      {
        name: 'Удар кулаком',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 10 (2d6+3) дробящего урона.',
        attackBonus: 6,
        damage: '2d6+3',
        damageType: 'дробящий'
      }
    ],
    source: 'Basic',
    environment: ['Мастерские', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'celestial-spirit',
    name: 'Дух Небожителя',
    nameEn: 'Celestial Spirit',
    size: 'Большой',
    type: 'Небожитель',
    alignment: 'законно-доброе',
    armorClass: 11,
    hitPoints: 40,
    hitDice: '6d10+6',
    speed: { walk: 30, fly: 60 },
    abilities: {
      strength: 16,
      dexterity: 14,
      constitution: 12,
      intelligence: 10,
      wisdom: 15,
      charisma: 17
    },
    damageResistances: ['лучистый'],
    conditionImmunities: ['очарованное', 'изнурение', 'испуганное'],
    senses: { 
      darkvision: 60,
      passivePerception: 12 
    },
    languages: ['Небесный', 'понимает языки создателя'],
    challengeRating: '5',
    experiencePoints: 1800,
    proficiencyBonus: 3,
    traits: [
      {
        name: 'Целительское сияние',
        description: 'Дух может лечить союзников в пределах 10 футов.'
      }
    ],
    actions: [
      {
        name: 'Сияющий лук',
        description: 'Дальнобойная атака оружием: +5 к попаданию, дистанция 150/600 фт., одна цель. Попадание: 7 (2d6) лучистого урона.',
        attackBonus: 5,
        damage: '2d6',
        damageType: 'лучистый'
      }
    ],
    source: 'Basic',
    environment: ['Верхние планы'],
    tokenSize: 2
  },

  {
    id: 'undead-spirit',
    name: 'Дух Нежити',
    nameEn: 'Undead Spirit',
    size: 'Средний',
    type: 'Нежить',
    alignment: 'нейтрально-злое',
    armorClass: 11,
    hitPoints: 30,
    hitDice: '6d8+6',
    speed: { walk: 30, fly: 40 },
    abilities: {
      strength: 12,
      dexterity: 16,
      constitution: 12,
      intelligence: 4,
      wisdom: 10,
      charisma: 9
    },
    damageImmunities: ['некротический', 'яд'],
    conditionImmunities: ['изнурение', 'отравленное'],
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['понимает языки, которые знал при жизни'],
    challengeRating: '3',
    experiencePoints: 700,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Бестелесность',
        description: 'Дух может проходить через существ и объекты.'
      }
    ],
    actions: [
      {
        name: 'Иссушающее касание',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (1d8+3) некротического урона.',
        attackBonus: 5,
        damage: '1d8+3',
        damageType: 'некротический'
      }
    ],
    source: 'Basic',
    environment: ['Кладбища', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'elemental-spirit',
    name: 'Дух Стихии',
    nameEn: 'Elemental Spirit',
    size: 'Средний',
    type: 'Элементаль',
    alignment: 'нейтральное',
    armorClass: 11,
    hitPoints: 50,
    hitDice: '8d8+16',
    speed: { walk: 40, fly: 60 },
    abilities: {
      strength: 18,
      dexterity: 15,
      constitution: 14,
      intelligence: 4,
      wisdom: 10,
      charisma: 16
    },
    damageImmunities: ['яд'],
    conditionImmunities: ['изнурение', 'паралич', 'окаменение', 'отравленное', 'без сознания'],
    senses: { 
      darkvision: 60,
      passivePerception: 10 
    },
    languages: ['Первичный', 'понимает языки создателя'],
    challengeRating: '5',
    experiencePoints: 1800,
    proficiencyBonus: 3,
    actions: [
      {
        name: 'Удар',
        description: 'Рукопашная атака оружием: +7 к попаданию, досягаемость 5 фт., одна цель. Попадание: 8 (1d8+4) дробящего урона.',
        attackBonus: 7,
        damage: '1d8+4',
        damageType: 'дробящий'
      }
    ],
    source: 'Basic',
    environment: ['Стихийные планы'],
    tokenSize: 1
  },

  {
    id: 'shadow-spirit',
    name: 'Дух Тени',
    nameEn: 'Shadow Spirit',
    size: 'Средний',
    type: 'Монстр',
    alignment: 'нейтрально-злое',
    armorClass: 11,
    hitPoints: 35,
    hitDice: '6d8+12',
    speed: { walk: 40, fly: 40 },
    abilities: {
      strength: 13,
      dexterity: 16,
      constitution: 15,
      intelligence: 4,
      wisdom: 10,
      charisma: 16
    },
    damageImmunities: ['некротический'],
    conditionImmunities: ['изнурение', 'испуганное'],
    senses: { 
      darkvision: 120,
      passivePerception: 10 
    },
    languages: ['понимает языки создателя, но не говорит'],
    challengeRating: '4',
    experiencePoints: 1100,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Теневое сокрытие',
        description: 'Находясь в тусклом свете или темноте, дух может скрыться бонусным действием.'
      }
    ],
    actions: [
      {
        name: 'Теневой удар',
        description: 'Рукопашная атака оружием: +6 к попаданию, досягаемость 5 фт., одна цель. Попадание: 7 (1d8+3) некротического урона.',
        attackBonus: 6,
        damage: '1d8+3',
        damageType: 'некротический'
      }
    ],
    source: 'Basic',
    environment: ['Теневой план', 'Подземелье'],
    tokenSize: 1
  },

  {
    id: 'fey-spirit',
    name: 'Дух Феи',
    nameEn: 'Fey Spirit',
    size: 'Маленький',
    type: 'Фея',
    alignment: 'нейтральное',
    armorClass: 12,
    hitPoints: 30,
    hitDice: '6d6+6',
    speed: { walk: 40, fly: 60 },
    abilities: {
      strength: 13,
      dexterity: 16,
      constitution: 12,
      intelligence: 14,
      wisdom: 15,
      charisma: 16
    },
    skills: { 
      perception: 4,
      stealth: 5
    },
    conditionImmunities: ['очарованное'],
    senses: { 
      darkvision: 60,
      passivePerception: 14 
    },
    languages: ['Сильван', 'понимает языки создателя'],
    challengeRating: '3',
    experiencePoints: 700,
    proficiencyBonus: 2,
    traits: [
      {
        name: 'Фейская магия',
        description: 'Дух может использовать простые заклинания иллюзии и очарования.'
      }
    ],
    actions: [
      {
        name: 'Природная атака',
        description: 'Рукопашная атака оружием: +5 к попаданию, досягаемость 5 фт., одна цель. Попадание: 6 (1d6+3) магического урона.',
        attackBonus: 5,
        damage: '1d6+3',
        damageType: 'магический'
      }
    ],
    source: 'Basic',
    environment: ['Леса', 'Фейвайлд'],
    tokenSize: 0.5
  },

  {
    id: 'spirit-dragon',
    name: 'Духовный дракон',
    nameEn: 'Spirit Dragon',
    size: 'Огромный',
    type: 'Дракон',
    alignment: 'нейтральное',
    armorClass: 17,
    hitPoints: 138,
    hitDice: '12d12+60',
    speed: { walk: 40, fly: 80 },
    abilities: {
      strength: 23,
      dexterity: 14,
      constitution: 21,
      intelligence: 16,
      wisdom: 15,
      charisma: 19
    },
    savingThrows: {
      dexterity: 7,
      constitution: 10,
      wisdom: 7,
      charisma: 9
    },
    skills: { 
      perception: 12,
      stealth: 7
    },
    damageImmunities: ['некротический'],
    senses: { 
      blindsight: 30,
      darkvision: 120,
      passivePerception: 22 
    },
    languages: ['Драконий', 'Общий'],
    challengeRating: '10',
    experiencePoints: 5900,
    proficiencyBonus: 4,
    traits: [
      {
        name: 'Легендарное сопротивление (2/день)',
        description: 'Если дракон проваливает спасбросок, он может вместо этого преуспеть в нём.'
      }
    ],
    actions: [
      {
        name: 'Мультиатака',
        description: 'Дракон совершает три атаки: одну укусом и две когтями.'
      },
      {
        name: 'Укус',
        description: 'Рукопашная атака оружием: +11 к попаданию, досягаемость 10 фт., одна цель. Попадание: 17 (2d10+6) колющего урона плюс 4 (1d8) некротического урона.',
        attackBonus: 11,
        damage: '2d10+6',
        damageType: 'колющий',
        additionalDamage: '1d8',
        additionalDamageType: 'некротический'
      }
    ],
    source: 'HB',
    environment: ['Горы', 'Духовные планы'],
    tokenSize: 3
  }
];

// Утилитарные функции для работы с монстрами
export function getMonstersByCR(cr: string): Monster[] {
  return MONSTERS_DATABASE.filter(monster => monster.challengeRating === cr);
}

export function getMonstersByType(type: string): Monster[] {
  return MONSTERS_DATABASE.filter(monster => monster.type === type);
}

export function getMonstersByEnvironment(environment: string): Monster[] {
  return MONSTERS_DATABASE.filter(monster => 
    monster.environment?.includes(environment)
  );
}

export function searchMonsters(query: string): Monster[] {
  const lowerQuery = query.toLowerCase();
  return MONSTERS_DATABASE.filter(monster =>
    monster.name.toLowerCase().includes(lowerQuery) ||
    monster.type.toLowerCase().includes(lowerQuery) ||
    monster.environment?.some(env => env.toLowerCase().includes(lowerQuery))
  );
}

export function getCRNumericValue(cr: string): number {
  switch (cr) {
    case '0': return 0;
    case '1/8': return 0.125;
    case '1/4': return 0.25;
    case '1/2': return 0.5;
    default: return parseInt(cr) || 0;
  }
}

export function sortMonstersByCR(monsters: Monster[]): Monster[] {
  return [...monsters].sort((a, b) => 
    getCRNumericValue(a.challengeRating) - getCRNumericValue(b.challengeRating)
  );
}