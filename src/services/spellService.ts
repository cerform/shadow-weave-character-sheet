
import { CharacterSpell } from '@/types/character';

// Список пустышек для имитации заклинаний
const mockSpells: CharacterSpell[] = [
  // Заговоры
  {
    id: '1',
    name: 'Волшебная рука',
    level: 0,
    school: 'Вызов',
    castingTime: '1 действие',
    range: '30 футов',
    components: 'В, С',
    duration: '1 минута',
    description: 'Вы создаете призрачную руку, способную манипулировать предметами на расстоянии.',
    classes: ['Бард', 'Волшебник', 'Колдун', 'Чародей']
  },
  {
    id: '2',
    name: 'Огненный снаряд',
    level: 0,
    school: 'Воплощение',
    castingTime: '1 действие',
    range: '120 футов',
    components: 'В, С',
    duration: 'Мгновенная',
    description: 'Вы запускаете сгусток огня во врага, наносящий урон огнём.',
    classes: ['Волшебник', 'Чародей']
  },
  {
    id: '3',
    name: 'Священное пламя',
    level: 0,
    school: 'Воплощение',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С',
    duration: 'Мгновенная',
    description: 'Пламя, подобное солнечному свету, нисходит на существо, нанося лучистый урон.',
    classes: ['Жрец']
  },
  
  // Заклинания 1 уровня
  {
    id: '4',
    name: 'Лечащее слово',
    level: 1,
    school: 'Воплощение',
    castingTime: '1 бонусное действие',
    range: '60 футов',
    components: 'В',
    duration: 'Мгновенная',
    description: 'Существо на ваш выбор восстанавливает хиты, а эффект увеличивается при накладывании на более высоких уровнях.',
    classes: ['Бард', 'Жрец', 'Друид']
  },
  {
    id: '5',
    name: 'Волна грома',
    level: 1,
    school: 'Воплощение',
    castingTime: '1 действие',
    range: 'На себя (15-футовый куб)',
    components: 'В, С',
    duration: 'Мгновенная',
    description: 'Волна громоподобной силы проносится от вас. Каждое существо в 15-футовом кубе, исходящем от вас должно совершить спасбросок Телосложения.',
    classes: ['Бард', 'Друид', 'Чародей', 'Волшебник']
  },
  {
    id: '6',
    name: 'Щит',
    level: 1,
    school: 'Ограждение',
    castingTime: '1 реакция',
    range: 'На себя',
    components: 'В, С',
    duration: '1 раунд',
    description: 'Невидимый барьер из магической силы появляется и защищает вас. До начала вашего следующего хода вы получаете бонус +5 к КД.',
    classes: ['Волшебник', 'Чародей']
  },
  
  // Заклинания 2 уровня
  {
    id: '7',
    name: 'Пылающий шар',
    level: 2,
    school: 'Вызов',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С, М',
    duration: 'Концентрация, до 1 минуты',
    description: 'Сфера из огня диаметром 5 футов появляется в выбранной вами точке в пределах дистанции и существует, пока заклинание активно.',
    classes: ['Волшебник', 'Друид', 'Чародей']
  },
  {
    id: '8',
    name: 'Невидимость',
    level: 2,
    school: 'Иллюзия',
    castingTime: '1 действие',
    range: 'Касание',
    components: 'В, С, М',
    duration: 'Концентрация, до 1 часа',
    description: 'Существо, которого вы касаетесь, становится невидимым до окончания действия заклинания.',
    classes: ['Бард', 'Волшебник', 'Колдун', 'Чародей']
  },
  
  // Заклинания 3 уровня
  {
    id: '9',
    name: 'Огненный шар',
    level: 3,
    school: 'Воплощение',
    castingTime: '1 действие',
    range: '150 футов',
    components: 'В, С, М',
    duration: 'Мгновенная',
    description: 'Яркий луч устремляется из вашего указательного пальца к выбранной точке, где расцветает с низким гулом в огненное извержение.',
    classes: ['Волшебник', 'Чародей']
  },
  {
    id: '10',
    name: 'Возрождение',
    level: 3,
    school: 'Некромантия',
    castingTime: '1 действие',
    range: 'Касание',
    components: 'В, С, М',
    duration: 'Мгновенная',
    description: 'Вы касаетесь существа, которое умерло не более одного хода назад. Существо возвращается к жизни с 1 хитом.',
    classes: ['Паладин', 'Жрец', 'Друид']
  },
  
  // Заклинания уровней 4-9 (по одному примеру)
  {
    id: '11',
    name: 'Изгнание',
    level: 4,
    school: 'Ограждение',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С, М',
    duration: 'Концентрация, до 1 минуты',
    description: 'Вы пытаетесь отправить одно существо, которое видите в пределах дистанции, на другой план существования.',
    classes: ['Жрец', 'Волшебник', 'Колдун', 'Чародей']
  },
  {
    id: '12',
    name: 'Призыв элементаля',
    level: 5,
    school: 'Вызов',
    castingTime: '1 минута',
    range: '90 футов',
    components: 'В, С, М',
    duration: 'Концентрация, до 1 часа',
    description: 'Вы вызываете элементаля с показателем опасности 5 или ниже, который появляется в свободном пространстве в пределах дистанции.',
    classes: ['Друид', 'Волшебник']
  },
  {
    id: '13',
    name: 'Распад',
    level: 6,
    school: 'Преобразование',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С, М',
    duration: 'Мгновенная',
    description: 'Луч зелёной энергии устремляется к одному существу в пределах дистанции заклинания, и существо должно совершить спасбросок Телосложения.',
    classes: ['Волшебник', 'Чародей', 'Колдун']
  },
  {
    id: '14',
    name: 'Перст смерти',
    level: 7,
    school: 'Некромантия',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В, С',
    duration: 'Мгновенная',
    description: 'Вы посылаете негативную энергию в одно существо, которое вы видите в пределах дистанции, причиняя ему мучительную боль.',
    classes: ['Волшебник', 'Чародей', 'Колдун']
  },
  {
    id: '15',
    name: 'Слово силы: оглушение',
    level: 8,
    school: 'Очарование',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В',
    duration: 'Мгновенная',
    description: 'Вы произносите слово силы, которое может подавить разум одного существа, которое вы видите в пределах дистанции.',
    classes: ['Бард', 'Волшебник', 'Колдун', 'Чародей']
  },
  {
    id: '16',
    name: 'Слово силы: смерть',
    level: 9,
    school: 'Очарование',
    castingTime: '1 действие',
    range: '60 футов',
    components: 'В',
    duration: 'Мгновенная',
    description: 'Вы произносите слово силы, которое может принудить одно существо с 100 или менее хитами, которое вы видите в пределах дистанции, мгновенно умереть.',
    classes: ['Бард', 'Волшебник', 'Чародей', 'Колдун']
  }
];

// Функция для имитации асинхронной загрузки заклинаний
export const fetchSpells = async (): Promise<CharacterSpell[]> => {
  // Имитируем задержку сетевого запроса
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // В реальном приложении здесь был бы запрос к API
  try {
    // Попытка загрузить заклинания из файла данных
    const response = await fetch('/data/spells.json');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Ошибка при загрузке заклинаний из файла:', error);
  }
  
  // Возвращаем моковые данные, если не удалось загрузить из файла
  return mockSpells;
};

// Функция для поиска заклинаний по имени
export const searchSpellsByName = async (name: string): Promise<CharacterSpell[]> => {
  const allSpells = await fetchSpells();
  return allSpells.filter(spell => 
    spell.name.toLowerCase().includes(name.toLowerCase())
  );
};

// Функция для получения заклинания по ID или имени
export const getSpellByIdOrName = async (idOrName: string): Promise<CharacterSpell | null> => {
  const allSpells = await fetchSpells();
  return allSpells.find(spell => 
    spell.id === idOrName || spell.name.toLowerCase() === idOrName.toLowerCase()
  ) || null;
};

// Функция для фильтрации заклинаний по различным параметрам
export const filterSpells = async (options: {
  level?: number | number[];
  school?: string | string[];
  className?: string | string[];
  search?: string;
}): Promise<CharacterSpell[]> => {
  const allSpells = await fetchSpells();
  
  return allSpells.filter(spell => {
    // Фильтр по уровню
    if (options.level !== undefined) {
      if (Array.isArray(options.level)) {
        if (!options.level.includes(spell.level)) return false;
      } else if (spell.level !== options.level) {
        return false;
      }
    }
    
    // Фильтр по школе
    if (options.school !== undefined && spell.school) {
      if (Array.isArray(options.school)) {
        if (!options.school.includes(spell.school)) return false;
      } else if (spell.school !== options.school) {
        return false;
      }
    }
    
    // Фильтр по классу
    if (options.className !== undefined && spell.classes) {
      if (Array.isArray(options.className)) {
        // Проверяем, доступно ли заклинание хотя бы для одного из указанных классов
        let foundMatchingClass = false;
        for (const cls of options.className) {
          if (
            (Array.isArray(spell.classes) && spell.classes.includes(cls)) ||
            (typeof spell.classes === 'string' && spell.classes === cls)
          ) {
            foundMatchingClass = true;
            break;
          }
        }
        if (!foundMatchingClass) return false;
      } else {
        // Проверяем, доступно ли заклинание для указанного класса
        if (
          (Array.isArray(spell.classes) && !spell.classes.includes(options.className)) &&
          (typeof spell.classes === 'string' && spell.classes !== options.className)
        ) {
          return false;
        }
      }
    }
    
    // Фильтр по поисковому запросу
    if (options.search) {
      return spell.name.toLowerCase().includes(options.search.toLowerCase());
    }
    
    return true;
  });
};
