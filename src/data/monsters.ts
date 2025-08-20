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