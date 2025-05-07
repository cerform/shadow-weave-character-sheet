
// Default values for character creation
export const availableRacesData = [
  { id: 'human', name: 'Человек', description: 'Универсальная раса, адаптируется к разным условиям' },
  { id: 'elf', name: 'Эльф', description: 'Изящная древняя раса, искусная в магии и долгоживущая' },
  { id: 'dwarf', name: 'Дварф', description: 'Выносливая раса мастеров-ремесленников и шахтеров' },
  { id: 'halfling', name: 'Полурослик', description: 'Маленькая раса с природной удачей и ловкостью' },
  { id: 'dragonborn', name: 'Драконорожденный', description: 'Раса с драконьим наследием и дыхательной атакой' }
];

export const availableClassesData = [
  { id: 'fighter', name: 'Воин', description: 'Мастер оружия и боевых техник', hitDice: 'd10', level: '1' },
  { id: 'wizard', name: 'Волшебник', description: 'Мудрый заклинатель с огромным арсеналом магии', hitDice: 'd6', level: '1' },
  { id: 'cleric', name: 'Жрец', description: 'Проводник божественной силы, целитель и защитник', hitDice: 'd8', level: '1' },
  { id: 'rogue', name: 'Плут', description: 'Ловкий специалист по скрытности и внезапным атакам', hitDice: 'd8', level: '1' },
  { id: 'bard', name: 'Бард', description: 'Универсальный вдохновитель с магией песен и историй', hitDice: 'd8', level: '1' }
];

export const availableBackgroundsData = [
  { id: 'acolyte', name: 'Служитель культа', description: 'Провел жизнь в служении храму' },
  { id: 'criminal', name: 'Преступник', description: 'Опытный нарушитель закона, знаток преступного мира' },
  { id: 'sage', name: 'Мудрец', description: 'Образованный исследователь с обширными знаниями' },
  { id: 'soldier', name: 'Солдат', description: 'Прошел военную службу в армии или ополчении' },
  { id: 'outlander', name: 'Чужеземец', description: 'Вырос вдали от цивилизации в диких землях' }
];

export const availableAlignments = [
  'Законно-добрый', 
  'Нейтрально-добрый', 
  'Хаотично-добрый',
  'Законно-нейтральный', 
  'Нейтральный', 
  'Хаотично-нейтральный',
  'Законно-злой', 
  'Нейтрально-злой', 
  'Хаотично-злой'
];

export const availableSkills = [
  'Акробатика', 
  'Атлетика', 
  'Восприятие', 
  'Выживание',
  'Запугивание', 
  'История', 
  'Ловкость рук', 
  'Магия',
  'Медицина', 
  'Обман', 
  'Природа', 
  'Проницательность',
  'Расследование', 
  'Религия', 
  'Скрытность', 
  'Убеждение',
  'Уход за животными'
];

export const availableLanguages = [
  'Общий', 
  'Дварфийский', 
  'Эльфийский', 
  'Гномий',
  'Полуросликов', 
  'Драконий', 
  'Гоблинский', 
  'Орочий',
  'Глубинный', 
  'Инфернальный', 
  'Небесный', 
  'Подземный'
];

export const availableEquipment = [
  // Оружие
  { id: 'longsword', name: 'Длинный меч', type: 'weapon', cost: '15 зм', damage: '1d8' },
  { id: 'dagger', name: 'Кинжал', type: 'weapon', cost: '2 зм', damage: '1d4' },
  { id: 'quarterstaff', name: 'Посох', type: 'weapon', cost: '2 см', damage: '1d6' },
  { id: 'shortbow', name: 'Короткий лук', type: 'weapon', cost: '25 зм', damage: '1d6' },
  
  // Доспехи
  { id: 'leather_armor', name: 'Кожаный доспех', type: 'armor', cost: '10 зм', ac: 11 },
  { id: 'chain_mail', name: 'Кольчуга', type: 'armor', cost: '75 зм', ac: 16 },
  { id: 'shield', name: 'Щит', type: 'armor', cost: '10 зм', ac: 2 },
  
  // Предметы
  { id: 'backpack', name: 'Рюкзак', type: 'item', cost: '2 зм' },
  { id: 'healers_kit', name: 'Набор целителя', type: 'item', cost: '5 зм', uses: 10 },
  { id: 'rope', name: 'Веревка (50 футов)', type: 'item', cost: '1 зм' }
];
