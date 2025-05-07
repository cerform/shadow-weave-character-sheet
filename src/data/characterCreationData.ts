
export const availableRacesData = [
  {
    id: 'human',
    name: 'Человек',
    description: 'Люди наиболее приспособлены и амбициозны среди всех распространённых народов. У них короткий срок жизни по сравнению с дварфами, эльфами и драконорождёнными, но они достигают своих целей с решимостью и запалом, которые другие находят удивительными.'
  },
  {
    id: 'dwarf',
    name: 'Дварф',
    description: 'Дварфы — коренастые и выносливые воины, гордые и стойкие щитом против монстров, угрожающих их общинам. В их крепостях и подземельях они создают прекрасные изделия из металла и камня.'
  },
  {
    id: 'elf',
    name: 'Эльф',
    description: 'Эльфы — волшебный народ с неземной красотой и дарованиями. Они долго живут и ближе всех ощущают магию мира.'
  },
  {
    id: 'halfling',
    name: 'Полурослик',
    description: 'Полурослики — миниатюрный народ с любовью к домашнему уюту и привычным вещам. Они небольшие размером, но обладают удивительным мужеством и великой силой воли.'
  },
  {
    id: 'dragonborn',
    name: 'Драконорождённый',
    description: 'Созданные в изначальном мире для служения драконам, драконорождённые ходят гордо по миру, где их хозяева теперь всего лишь миф. Они соединяют в себе лучшее от драконов и гуманоидов.'
  },
  {
    id: 'gnome',
    name: 'Гном',
    description: 'Гномы обычно живут по 350-500 лет. Они ценят жизнь и наслаждаются каждым моментом. У них есть хорошее чувство юмора и высокий уровень интеллекта.'
  },
  {
    id: 'halfelf',
    name: 'Полуэльф',
    description: 'Полуэльфы сочетают в себе черты эльфийского и человеческого родителей. Они наследуют красоту и долгую жизнь эльфов, но при этом более разносторонни, как люди.'
  },
  {
    id: 'halforc',
    name: 'Полуорк',
    description: 'Полуорки сочетают в себе черты человеческого и оркского родителей. Они могут быть жестокими, но их сложная жизнь закалила их.'
  },
  {
    id: 'tiefling',
    name: 'Тифлинг',
    description: 'Тифлинги имеют инфернальное (адское) наследие благодаря союзу с Асмодеем — повелителем Девяти Преисподних. Они обладают рогами, хвостами и несут на себе запах серы.'
  }
];

export const availableClassesData = [
  {
    id: 'barbarian',
    name: 'Варвар',
    description: 'Варвар — свирепый воин, использующий ярость и инстинкты в бою.',
    hitDice: 'd12',
    level: '1'
  },
  {
    id: 'bard',
    name: 'Бард',
    description: 'Бард — заклинатель, чье вдохновение и музыка воплощают магию.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'cleric',
    name: 'Жрец',
    description: 'Жрец — проводник божественной мощи, служитель богов.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'druid',
    name: 'Друид',
    description: 'Друид — хранитель природы, использующий силы стихий и животных.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'fighter',
    name: 'Воин',
    description: 'Воин — мастер боевых искусств, эксперт во владении оружием.',
    hitDice: 'd10',
    level: '1'
  },
  {
    id: 'monk',
    name: 'Монах',
    description: 'Монах — мастер боевых искусств без оружия, объединяющий тело и разум.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'paladin',
    name: 'Паладин',
    description: 'Паладин — рыцарь священной клятвы, сочетающий боевые и магические навыки.',
    hitDice: 'd10',
    level: '1'
  },
  {
    id: 'ranger',
    name: 'Следопыт',
    description: 'Следопыт — охотник и скаут, сочетающий боевые навыки с природной магией.',
    hitDice: 'd10',
    level: '1'
  },
  {
    id: 'rogue',
    name: 'Плут',
    description: 'Плут — ловкий и хитрый авантюрист, мастер скрытности и точных ударов.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'sorcerer',
    name: 'Чародей',
    description: 'Чародей — заклинатель с врождённым магическим даром.',
    hitDice: 'd6',
    level: '1'
  },
  {
    id: 'warlock',
    name: 'Колдун',
    description: 'Колдун — заклинатель, заключивший договор с могущественным созданием.',
    hitDice: 'd8',
    level: '1'
  },
  {
    id: 'wizard',
    name: 'Волшебник',
    description: 'Волшебник — учёный маг, изучающий тайные секреты мультивселенной.',
    hitDice: 'd6',
    level: '1'
  }
];

export const availableBackgroundsData = [
  {
    id: 'acolyte',
    name: 'Послушник',
    description: 'Служитель храма или религиозного культа.'
  },
  {
    id: 'charlatan',
    name: 'Шарлатан',
    description: 'Мошенник и обманщик, выдающий себя за других людей.'
  },
  {
    id: 'criminal',
    name: 'Преступник',
    description: 'Опытный нарушитель закона, имеющий преступное прошлое.'
  },
  {
    id: 'entertainer',
    name: 'Артист',
    description: 'Актер, музыкант или иной исполнитель, развлекающий публику.'
  },
  {
    id: 'folk_hero',
    name: 'Народный герой',
    description: 'Простолюдин, ставший знаменитым благодаря героическому поступку.'
  },
  {
    id: 'guild_artisan',
    name: 'Гильдейский ремесленник',
    description: 'Мастер ремесла и член гильдии.'
  },
  {
    id: 'hermit',
    name: 'Отшельник',
    description: 'Человек, изолировавший себя от общества для познания.'
  },
  {
    id: 'noble',
    name: 'Благородный',
    description: 'Представитель привилегированного общественного класса.'
  },
  {
    id: 'outlander',
    name: 'Чужеземец',
    description: 'Пришелец из других земель, выживающий в дикой местности.'
  },
  {
    id: 'sage',
    name: 'Мудрец',
    description: 'Учёный или исследователь, посвятивший жизнь знаниям.'
  },
  {
    id: 'sailor',
    name: 'Моряк',
    description: 'Бывалый мореход, прошедший множество морских путей.'
  },
  {
    id: 'soldier',
    name: 'Солдат',
    description: 'Ветеран войн, служивший в армии.'
  },
  {
    id: 'urchin',
    name: 'Беспризорник',
    description: 'Выросший на улице ребенок, научившийся выживать.'
  }
];

export const availableAlignments = [
  { id: 'lawful_good', name: 'Законно-добрый' },
  { id: 'neutral_good', name: 'Нейтрально-добрый' },
  { id: 'chaotic_good', name: 'Хаотично-добрый' },
  { id: 'lawful_neutral', name: 'Законно-нейтральный' },
  { id: 'true_neutral', name: 'Истинно нейтральный' },
  { id: 'chaotic_neutral', name: 'Хаотично-нейтральный' },
  { id: 'lawful_evil', name: 'Законно-злой' },
  { id: 'neutral_evil', name: 'Нейтрально-злой' },
  { id: 'chaotic_evil', name: 'Хаотично-злой' }
];

export const availableSkills = [
  { id: 'acrobatics', name: 'Акробатика', ability: 'dexterity' },
  { id: 'animal_handling', name: 'Обращение с животными', ability: 'wisdom' },
  { id: 'arcana', name: 'Магия', ability: 'intelligence' },
  { id: 'athletics', name: 'Атлетика', ability: 'strength' },
  { id: 'deception', name: 'Обман', ability: 'charisma' },
  { id: 'history', name: 'История', ability: 'intelligence' },
  { id: 'insight', name: 'Проницательность', ability: 'wisdom' },
  { id: 'intimidation', name: 'Запугивание', ability: 'charisma' },
  { id: 'investigation', name: 'Расследование', ability: 'intelligence' },
  { id: 'medicine', name: 'Медицина', ability: 'wisdom' },
  { id: 'nature', name: 'Природа', ability: 'intelligence' },
  { id: 'perception', name: 'Восприятие', ability: 'wisdom' },
  { id: 'performance', name: 'Выступление', ability: 'charisma' },
  { id: 'persuasion', name: 'Убеждение', ability: 'charisma' },
  { id: 'religion', name: 'Религия', ability: 'intelligence' },
  { id: 'sleight_of_hand', name: 'Ловкость рук', ability: 'dexterity' },
  { id: 'stealth', name: 'Скрытность', ability: 'dexterity' },
  { id: 'survival', name: 'Выживание', ability: 'wisdom' }
];

export const availableLanguages = [
  { id: 'common', name: 'Общий' },
  { id: 'dwarvish', name: 'Дварфийский' },
  { id: 'elvish', name: 'Эльфийский' },
  { id: 'giant', name: 'Великаний' },
  { id: 'gnomish', name: 'Гномий' },
  { id: 'goblin', name: 'Гоблинский' },
  { id: 'halfling', name: 'Полуросличий' },
  { id: 'orc', name: 'Орочий' },
  { id: 'abyssal', name: 'Бездны' },
  { id: 'celestial', name: 'Небесный' },
  { id: 'draconic', name: 'Драконий' },
  { id: 'deep_speech', name: 'Глубинная речь' },
  { id: 'infernal', name: 'Инфернальный' },
  { id: 'primordial', name: 'Первичный' },
  { id: 'sylvan', name: 'Сильван' },
  { id: 'undercommon', name: 'Подземный' }
];

export const availableEquipment = [
  // Оружие
  { id: 'club', name: 'Дубинка', type: 'weapon', category: 'simple', damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['light'] },
  { id: 'dagger', name: 'Кинжал', type: 'weapon', category: 'simple', damage: '1d4', damageType: 'piercing', weight: 1, properties: ['finesse', 'light', 'thrown'] },
  { id: 'greatclub', name: 'Палица', type: 'weapon', category: 'simple', damage: '1d8', damageType: 'bludgeoning', weight: 10, properties: ['two-handed'] },
  { id: 'handaxe', name: 'Ручной топор', type: 'weapon', category: 'simple', damage: '1d6', damageType: 'slashing', weight: 2, properties: ['light', 'thrown'] },
  { id: 'javelin', name: 'Метательное копьё', type: 'weapon', category: 'simple', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['thrown'] },
  { id: 'light_hammer', name: 'Лёгкий молот', type: 'weapon', category: 'simple', damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['light', 'thrown'] },
  { id: 'mace', name: 'Булава', type: 'weapon', category: 'simple', damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: [] },
  { id: 'quarterstaff', name: 'Боевой посох', type: 'weapon', category: 'simple', damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: ['versatile'] },
  { id: 'spear', name: 'Копьё', type: 'weapon', category: 'simple', damage: '1d6', damageType: 'piercing', weight: 3, properties: ['thrown', 'versatile'] },
  { id: 'crossbow_light', name: 'Лёгкий арбалет', type: 'weapon', category: 'simple', damage: '1d8', damageType: 'piercing', weight: 5, properties: ['ammunition', 'loading', 'two-handed'] },
  { id: 'shortbow', name: 'Короткий лук', type: 'weapon', category: 'simple', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['ammunition', 'two-handed'] },
  { id: 'battleaxe', name: 'Боевой топор', type: 'weapon', category: 'martial', damage: '1d8', damageType: 'slashing', weight: 4, properties: ['versatile'] },
  { id: 'longsword', name: 'Длинный меч', type: 'weapon', category: 'martial', damage: '1d8', damageType: 'slashing', weight: 3, properties: ['versatile'] },
  { id: 'greatsword', name: 'Двуручный меч', type: 'weapon', category: 'martial', damage: '2d6', damageType: 'slashing', weight: 6, properties: ['heavy', 'two-handed'] },
  
  // Доспехи
  { id: 'leather', name: 'Кожаный доспех', type: 'armor', category: 'light', ac: 11, weight: 10 },
  { id: 'chain_shirt', name: 'Кольчужная рубаха', type: 'armor', category: 'medium', ac: 13, weight: 20 },
  { id: 'scale_mail', name: 'Чешуйчатый доспех', type: 'armor', category: 'medium', ac: 14, weight: 45 },
  { id: 'plate', name: 'Латы', type: 'armor', category: 'heavy', ac: 18, weight: 65 },
  { id: 'shield', name: 'Щит', type: 'armor', category: 'shield', ac: 2, weight: 6 },
  
  // Снаряжение
  { id: 'backpack', name: 'Рюкзак', type: 'gear', weight: 5 },
  { id: 'bedroll', name: 'Спальник', type: 'gear', weight: 7 },
  { id: 'rations', name: 'Рационы (1 день)', type: 'gear', weight: 2 },
  { id: 'rope_hempen', name: 'Пеньковая верёвка (50 футов)', type: 'gear', weight: 10 },
  { id: 'torch', name: 'Факел', type: 'gear', weight: 1 },
  { id: 'waterskin', name: 'Бурдюк', type: 'gear', weight: 5 },
  
  // Инструменты
  { id: 'thieves_tools', name: 'Воровские инструменты', type: 'tool', weight: 1 },
  { id: 'herbalism_kit', name: 'Набор травника', type: 'tool', weight: 3 },
  { id: 'healers_kit', name: 'Набор целителя', type: 'tool', weight: 3 }
];
