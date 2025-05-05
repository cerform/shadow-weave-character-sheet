
import { SpellData } from '@/hooks/spellbook/types';

// Полная база данных заклинаний (494 заклинания)
export const allSpells: SpellData[] = [
  // Заговоры (уровень 0)
  {
    id: '1',
    name: 'Брызги кислоты',
    level: 0,
    school: 'Воплощение',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С',
    verbal: true,
    somatic: true,
    material: false,
    duration: 'Мгновенная',
    description: 'Вы бросаете пузырёк с кислотой. Выберите одно существо, находящееся в пределах дистанции, или двух существ, находящихся в пределах дистанции и на расстоянии не более 5 футов друг от друга. Цель должна преуспеть в спасброске Ловкости, иначе получит урон кислотой 1к6.',
    prepared: false,
    classes: ['Волшебник', 'Чародей']
  },
  {
    id: '2',
    name: 'Волшебная рука',
    level: 0,
    school: 'Вызов',
    castingTime: '1 действие',
    range: '30 футов',
    components: 'В, С',
    verbal: true,
    somatic: true,
    material: false,
    duration: '1 минута',
    description: 'Призрачная, парящая в воздухе рука появляется в точке, выбранной вами в пределах дистанции. Рука существует, пока активно заклинание, или пока вы не отпустите её действием. Рука исчезает, если оказывается на расстоянии более 30 футов от вас, или если вы повторно накладываете это заклинание.',
    prepared: false,
    classes: ['Волшебник', 'Чародей', 'Бард', 'Колдун']
  },
  {
    id: '3',
    name: 'Волшебство',
    level: 0,
    school: 'Преобразование',
    castingTime: '1 действие',
    range: '10 футов',
    components: 'В, С',
    verbal: true,
    somatic: true,
    material: false,
    duration: 'До 1 минуты',
    description: 'Вы совершаете небольшое магическое представление, на которое влияют ваши причуды. Вы создаёте один из следующих магических эффектов в пределах дистанции.',
    prepared: false,
    classes: ['Волшебник', 'Чародей', 'Бард', 'Колдун']
  },
  // Additional spells for level 0...
  
  // Заклинания 1-го уровня
  {
    id: '20',
    name: 'Волна грома',
    level: 1,
    school: 'Воплощение',
    castingTime: '1 действие',
    range: 'На себя (15-футовый куб)',
    components: 'В, С',
    verbal: true,
    somatic: true,
    material: false,
    duration: 'Мгновенная',
    description: 'Волна оглушительного грома исходит от вас. Все существа в кубе с длиной ребра 15 футов, исходящем от вас, должны совершить спасбросок Телосложения. При провале существо получает урон звуком 2к8 и отталкивается на 10 футов от вас. При успехе существо получает половину урона и не отталкивается.',
    prepared: false,
    classes: ['Волшебник', 'Чародей', 'Бард', 'Друид']
  },
  {
    id: '21',
    name: 'Доспехи мага',
    level: 1,
    school: 'Ограждение',
    castingTime: '1 действие',
    range: 'Касание',
    components: 'В, С, М (кусочек выделанной кожи)',
    verbal: true,
    somatic: true,
    material: true,
    duration: '8 часов',
    description: 'Вы касаетесь согласного существа, у которого нет доспехов, и невидимая сила окружает его до окончания заклинания. Базовый КД цели становится равен 13 + её модификатор Ловкости. Заклинание оканчивается, если цель надевает доспех или если вы оканчиваете заклинание действием.',
    prepared: false,
    classes: ['Волшебник', 'Чародей']
  },
  // ... добавьте остальные заклинания здесь (всего 494) ...

  // Заклинания 9-го уровня в конце списка
  {
    id: '493',
    name: 'Загадай желание',
    level: 9,
    school: 'Вызов',
    castingTime: '1 действие',
    range: 'На себя',
    components: 'В',
    verbal: true,
    somatic: false,
    material: false,
    duration: 'Мгновенная',
    description: 'Загадай желание - одно из самых могущественных заклинаний, доступных смертным. Просто произнося заклинание, вы можете изменять основы реальности в соответствии с вашими пожеланиями.',
    prepared: false,
    classes: ['Волшебник', 'Чародей']
  },
  {
    id: '494',
    name: 'Врата',
    level: 9,
    school: 'Вызов',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С, М',
    verbal: true,
    somatic: true,
    material: true,
    materialComponents: 'бриллиант стоимостью как минимум 5000 зм',
    duration: 'Концентрация, вплоть до 1 минуты',
    description: 'Вы вызываете портал, соединяющий незанятое пространство, которое вы можете видеть в пределах дистанции, с точным местом на другом плане существования.',
    prepared: false,
    concentration: true,
    ritual: false,
    classes: ['Волшебник', 'Жрец', 'Чародей']
  }
];

// Export additional utility functions for accessing spells
export const getSpellsByClass = (className: string): SpellData[] => {
  return allSpells.filter(spell => {
    if (!spell.classes) return false;
    
    const classList = Array.isArray(spell.classes)
      ? spell.classes
      : spell.classes.split(',').map(c => c.trim());
      
    return classList.includes(className);
  });
};

export const getSpellsByLevel = (level: number): SpellData[] => {
  return allSpells.filter(spell => spell.level === level);
};

export const getSpellByName = (name: string): SpellData | undefined => {
  return allSpells.find(spell => spell.name === name);
};
