
// Export race data
export const races = [
  {
    id: 'dwarf',
    name: 'Дварф',
    description: 'Смелые и выносливые жители подземных городов.',
  },
  {
    id: 'elf',
    name: 'Эльф',
    description: 'Магический народ с неземной грацией.',
  },
  {
    id: 'halfling',
    name: 'Полурослик',
    description: 'Маленький народ с большим сердцем и удачей.',
  },
  {
    id: 'human',
    name: 'Человек',
    description: 'Самая распространенная и адаптивная раса.',
  },
  {
    id: 'dragonborn',
    name: 'Драконорожденный',
    description: 'Потомки драконов с дыхательным оружием.',
  },
  {
    id: 'gnome',
    name: 'Гном',
    description: 'Изобретательные и любознательные мастера.',
  },
  {
    id: 'half-elf',
    name: 'Полуэльф',
    description: 'Сочетающие лучшее от людей и эльфов.',
  },
  {
    id: 'half-orc',
    name: 'Полуорк',
    description: 'Сильные и выносливые воины со свирепым нравом.',
  },
  {
    id: 'tiefling',
    name: 'Тифлинг',
    description: 'Потомки демонов с врожденной магией.',
  },
];

// Export class data
export const classes = [
  {
    id: 'barbarian',
    name: 'Варвар',
    description: 'Свирепые воины, черпающие силу в ярости.',
    hitDice: 'd12',
    level: '1'
  },
  {
    id: 'bard',
    name: 'Бард',
    description: 'Вдохновляющие артисты, владеющие магией слов и музыки.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'cleric',
    name: 'Жрец',
    description: 'Служитель божества, владеющий божественной магией.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'druid',
    name: 'Друид',
    description: 'Хранитель природы, способный принимать облик зверей.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'fighter',
    name: 'Воин',
    description: 'Мастер оружия и боевых техник.',
    hitDice: 'd10',
    level: '1'
  },
  {
    id: 'monk',
    name: 'Монах',
    description: 'Мастер боевых искусств с мистическими способностями.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'paladin',
    name: 'Паладин',
    description: 'Святой рыцарь, связанный клятвой и божественной силой.',
    hitDice: 'd10',
    level: '1'
  },
  {
    id: 'ranger',
    name: 'Следопыт',
    description: 'Охотник и следопыт дикой местности.',
    hitDice: 'd10',
    level: '1'
  },
  {
    id: 'rogue',
    name: 'Плут',
    description: 'Ловкий и хитрый мастер скрытности и обмана.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'sorcerer',
    name: 'Чародей',
    description: 'Заклинатель с врожденной магической силой.',
    hitDice: 'd6',
    level: '1'
  },
  {
    id: 'warlock',
    name: 'Колдун',
    description: 'Заклинатель, заключивший пакт с могущественной сущностью.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'wizard',
    name: 'Волшебник',
    description: 'Ученый магии, изучающий заклинания.',
    hitDice: 'd6',
    level: '1'
  }
];

// Export background data
export const backgrounds = [
  {
    id: 'acolyte',
    name: 'Служитель',
    description: 'Помощник в храме, посвятивший жизнь служению богам.',
    skills: ['insight', 'religion'],
    languages: 2,
    equipment: ['священный символ', 'молитвенник', 'благовония (5)', 'жреческие одежды', 'обычная одежда', '15 зм']
  },
  {
    id: 'criminal',
    name: 'Преступник',
    description: 'Опытный нарушитель закона, вор или бандит.',
    skills: ['deception', 'stealth'],
    tools: ['воровские инструменты', 'карточные игры'],
    equipment: ['воровские инструменты', 'тёмная одежда с капюшоном', '15 зм']
  },
  {
    id: 'folk-hero',
    name: 'Народный герой',
    description: 'Человек из народа, вставший на защиту своей общины.',
    skills: ['animal-handling', 'survival'],
    tools: ['ремесленные инструменты', 'сухопутный транспорт'],
    equipment: ['набор ремесленных инструментов', 'лопата', 'железный горшок', 'обычная одежда', '10 зм']
  },
  {
    id: 'noble',
    name: 'Благородный',
    description: 'Привилегированный член высшего общества.',
    skills: ['history', 'persuasion'],
    languages: 1,
    gaming_set: 1,
    equipment: ['дорогая одежда', 'перстень-печатка', 'родословная', '25 зм']
  },
  {
    id: 'sage',
    name: 'Мудрец',
    description: 'Учёный или академик, посвятивший жизнь знаниям.',
    skills: ['arcana', 'history'],
    languages: 2,
    equipment: ['книга с заметками', 'перо', 'чернила', 'пергамент (10)', 'мешочек с песком', 'маленький нож', '10 зм']
  },
  {
    id: 'soldier',
    name: 'Солдат',
    description: 'Тренированный боец на службе армии или наёмник.',
    skills: ['athletics', 'intimidation'],
    tools: ['азартные игры', 'сухопутный транспорт'],
    equipment: ['знак ранга', 'трофей с поверженного врага', 'колода карт', 'обычная одежда', '10 зм']
  }
];

// Export other data needed for character creation
export const alignments = [
  { id: 'lg', name: 'Законно-добрый' },
  { id: 'ng', name: 'Нейтрально-добрый' },
  { id: 'cg', name: 'Хаотично-добрый' },
  { id: 'ln', name: 'Законно-нейтральный' },
  { id: 'n', name: 'Нейтральный' },
  { id: 'cn', name: 'Хаотично-нейтральный' },
  { id: 'le', name: 'Законно-злой' },
  { id: 'ne', name: 'Нейтрально-злой' },
  { id: 'ce', name: 'Хаотично-злой' }
];

// Export abilities
export const abilities = [
  { id: 'strength', name: 'Сила', abbr: 'СИЛ' },
  { id: 'dexterity', name: 'Ловкость', abbr: 'ЛОВ' },
  { id: 'constitution', name: 'Телосложение', abbr: 'ТЕЛ' },
  { id: 'intelligence', name: 'Интеллект', abbr: 'ИНТ' },
  { id: 'wisdom', name: 'Мудрость', abbr: 'МУД' },
  { id: 'charisma', name: 'Харизма', abbr: 'ХАР' }
];

// Export skills with their associated abilities
export const skills = [
  { id: 'athletics', name: 'Атлетика', ability: 'strength' },
  { id: 'acrobatics', name: 'Акробатика', ability: 'dexterity' },
  { id: 'sleight-of-hand', name: 'Ловкость рук', ability: 'dexterity' },
  { id: 'stealth', name: 'Скрытность', ability: 'dexterity' },
  { id: 'arcana', name: 'Магия', ability: 'intelligence' },
  { id: 'history', name: 'История', ability: 'intelligence' },
  { id: 'investigation', name: 'Анализ', ability: 'intelligence' },
  { id: 'nature', name: 'Природа', ability: 'intelligence' },
  { id: 'religion', name: 'Религия', ability: 'intelligence' },
  { id: 'animal-handling', name: 'Уход за животными', ability: 'wisdom' },
  { id: 'insight', name: 'Проницательность', ability: 'wisdom' },
  { id: 'medicine', name: 'Медицина', ability: 'wisdom' },
  { id: 'perception', name: 'Восприятие', ability: 'wisdom' },
  { id: 'survival', name: 'Выживание', ability: 'wisdom' },
  { id: 'deception', name: 'Обман', ability: 'charisma' },
  { id: 'intimidation', name: 'Запугивание', ability: 'charisma' },
  { id: 'performance', name: 'Выступление', ability: 'charisma' },
  { id: 'persuasion', name: 'Убеждение', ability: 'charisma' }
];
