
import { SpellData } from '@/types/spells';

// Массив заклинаний
export const spells: SpellData[] = [
  {
    id: 'light',
    name: 'Свет',
    level: 0,
    school: 'Вызов',
    castingTime: '1 действие',
    range: 'Касание',
    components: 'ВМ',
    duration: '1 час',
    description: ['Вы касаетесь одного объекта, не превышающего 10 футов в любом измерении. До окончания заклинания объект испускает яркий свет в радиусе 20 футов.'],
    classes: ['Бард', 'Волшебник', 'Жрец'],
    ritual: false,
    concentration: false
  },
  {
    id: 'mage-hand',
    name: 'Волшебная рука',
    level: 0,
    school: 'Вызов',
    castingTime: '1 действие',
    range: '30 футов',
    components: 'ВС',
    duration: '1 минута',
    description: ['Призрачная плавающая рука появляется в указанной вами точке.'],
    classes: ['Бард', 'Волшебник', 'Чародей'],
    ritual: false,
    concentration: false
  },
  {
    id: 'mage-armor',
    name: 'Волшебная броня',
    level: 1,
    school: 'Ограждение',
    castingTime: '1 действие',
    range: 'Касание',
    components: 'ВСМ',
    duration: '8 часов',
    description: ['Вы касаетесь согласного существа, не носящего доспехи. Пока заклинание активно, КД существа равно 13 + его модификатор Ловкости.'],
    classes: ['Волшебник'],
    ritual: false,
    concentration: false
  },
  {
    id: 'healing-word',
    name: 'Лечащее слово',
    level: 1,
    school: 'Вызов',
    castingTime: '1 бонусное действие',
    range: '60 футов',
    components: 'В',
    duration: 'Мгновенная',
    description: ['Вы произносите слово исцеления и существо на ваш выбор, видимое вами в радиусе действия, восстанавливает 1d4 + ваш модификатор базовой характеристики хиты.'],
    classes: ['Бард', 'Жрец', 'Друид'],
    ritual: false,
    concentration: false
  }
];

// Функция для получения всех заклинаний
export const getAllSpells = (): SpellData[] => {
  return spells;
};

// Функция для получения заклинаний по классу
export const getSpellsByClass = (characterClass: string): SpellData[] => {
  const lowerClass = characterClass.toLowerCase();
  
  // Маппинг русских названий классов на английские
  const classMap: Record<string, string[]> = {
    'жрец': ['cleric', 'жрец'],
    'волшебник': ['wizard', 'волшебник'],
    'бард': ['bard', 'бард'],
    'друид': ['druid', 'друид'],
    'колдун': ['warlock', 'колдун'],
    'чародей': ['sorcerer', 'чародей'],
    'паладин': ['paladin', 'паладин'],
    'следопыт': ['ranger', 'следопыт'],
    'изобретатель': ['artificer', 'изобретатель']
  };
  
  const classesToSearch = classMap[lowerClass] || [lowerClass];
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    // Проверяем, содержит ли массив классов заклинания нужный класс
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => {
        const lowerSpellClass = spellClass.toLowerCase();
        return classesToSearch.includes(lowerSpellClass);
      });
    }
    
    // Если classes - строка
    const lowerSpellClass = spell.classes.toLowerCase();
    return classesToSearch.includes(lowerSpellClass);
  });
};
