
// Базовые архитипы классов D&D 5e
export const subclassData: Record<string, Record<string, any>> = {
  "Бард": {
    "Коллегия Знаний": {
      description: "Барды Коллегии Знаний собирают знания по всему миру. Они учатся на протяжении всей жизни и используют свои навыки, чтобы быть мастерами на все руки.",
      features: [
        {
          title: "Бонусные владения",
          level: 3,
          description: "Вы получаете владение тремя навыками на ваш выбор."
        },
        {
          title: "Слова прозрения",
          level: 3,
          description: "Вы можете тратить одно использование Бардовского вдохновения, чтобы добавить его кость к своей проверке характеристики."
        },
        {
          title: "Дополнительные магические секреты",
          level: 6,
          description: "Вы узнаёте два заклинания на свой выбор из любого класса. Эти заклинания считаются для вас заклинаниями барда."
        },
        {
          title: "Способный",
          level: 14,
          description: "Когда вы совершаете проверку характеристики, у которой есть бонус мастерства, вы можете использовать Бардовское вдохновение, добавляя его к результату. Вы можете принять это решение после броска, но до объявления результата."
        }
      ]
    },
    "Коллегия Доблести": {
      description: "Барды Коллегии Доблести обучаются высказывать правду, вдохновлять героизм и демонстрировать исключительное мастерство в искусстве боя.",
      features: [
        {
          title: "Бонусные владения",
          level: 3,
          description: "Вы получаете владение средними доспехами, щитами и боевым оружием."
        },
        {
          title: "Боевое вдохновение",
          level: 3,
          description: "Вы можете использовать бардовское вдохновение, чтобы вдохновлять своих союзников в бою."
        },
        {
          title: "Дополнительная атака",
          level: 6,
          description: "Вы можете атаковать дважды вместо одного раза, когда в свой ход совершаете действие Атака."
        },
        {
          title: "Боевая магия",
          level: 14,
          description: "Если вы используете действие для накладывания заклинания барда, вы можете совершить одну атаку оружием бонусным действием."
        }
      ]
    }
  },
  "Жрец": {
    "Домен Жизни": {
      description: "Домен Жизни фокусируется на живительной энергии, которая течет во всех живых существах. Жрецы с этим доменом - целители и защитники, противники нежити и сил смерти.",
      features: [
        {
          title: "Бонусное владение",
          level: 1,
          description: "Вы получаете владение тяжёлыми доспехами."
        },
        {
          title: "Ученик жизни",
          level: 1,
          description: "Заклинания исцеления, которые вы накладываете на других, восстанавливают больше хитов."
        },
        {
          title: "Божественный канал: Сохранение жизни",
          level: 2,
          description: "Вы можете использовать Божественный канал, чтобы исцелять тяжело раненых существ."
        },
        {
          title: "Благословенный целитель",
          level: 6,
          description: "Заклинания исцеления, которые вы накладываете на других, также исцеляют и вас."
        },
        {
          title: "Божественный удар",
          level: 8,
          description: "Один раз в каждый свой ход, когда вы попадаете по существу атакой оружием, вы можете причинить цели дополнительный урон сияющей энергией."
        },
        {
          title: "Превосходное исцеление",
          level: 17,
          description: "Когда вы восстанавливаете хиты заклинанием 1 уровня или выше, вместо броска восстанавливается максимально возможное количество хитов."
        }
      ]
    },
    "Домен Войны": {
      description: "Домен Войны включает в себя божеств смелости, силы в бою, и соблюдения закона на поле брани. Жрецы этого домена - опытные бойцы, которые тренируются для того, чтобы стать силами разрушения.",
      features: [
        {
          title: "Бонусные владения",
          level: 1,
          description: "Вы получаете владение воинским оружием и тяжёлыми доспехами."
        },
        {
          title: "Воин бога войны",
          level: 1,
          description: "В свой ход, когда вы используете действие Атака, вы можете совершить одну атаку оружием бонусным действием."
        },
        {
          title: "Божественный канал: Направленный удар",
          level: 2,
          description: "Вы можете использовать Божественный канал, чтобы получить бонус +10 к броску атаки."
        },
        {
          title: "Божественный канал: Благословение бога войны",
          level: 6,
          description: "Когда существо в пределах 30 футов совершает бросок атаки, вы можете реакцией дать ему бонус +10 к этому броску."
        },
        {
          title: "Божественный удар",
          level: 8,
          description: "Один раз в каждый свой ход, когда вы попадаете по существу атакой оружием, вы можете причинить цели дополнительный урон сияющей энергией."
        },
        {
          title: "Аватар битвы",
          level: 17,
          description: "Вы получаете сопротивление к урону дробящим, колющим и рубящим оружием."
        }
      ]
    }
  },
  "Волшебник": {
    "Школа Прорицания": {
      description: "Прорицатели стремятся разорвать завесу пространства, времени и сознания, чтобы увидеть в далях и узнать секреты, скрытые от обычных чувств.",
      features: [
        {
          title: "Ученик прорицания",
          level: 2,
          description: "Золото и время, которые вы тратите для копирования заклинания прорицания в свою книгу заклинаний, уменьшаются вдвое."
        },
        {
          title: "Знамение",
          level: 2,
          description: "Вы можете потратить 2 очка колдовства, чтобы получить преимущество на один бросок атаки, спасбросок или проверку характеристики."
        },
        {
          title: "Мистическое предсказание",
          level: 6,
          description: "Вы начинаете видеть полоски удачи вокруг себя и могу обращаться к ним за руководством."
        },
        {
          title: "Третий глаз",
          level: 10,
          description: "Вы можете использовать действие, чтобы увеличить силу своего восприятия."
        },
        {
          title: "Великий прорицатель",
          level: 14,
          description: "Ваша способность предвидеть будущее даёт вам постоянное преимущество на броски инициативы."
        }
      ]
    },
    "Школа Воплощения": {
      description: "Маги Школы Воплощения фокусируются на манипулировании энергией и материей. Они могут концентрировать элементальную энергию и превращать её в сокрушительные взрывы.",
      features: [
        {
          title: "Ученик воплощения",
          level: 2,
          description: "Золото и время, которые вы тратите для копирования заклинания воплощения в свою книгу заклинаний, уменьшаются вдвое."
        },
        {
          title: "Искусная воплощение",
          level: 2,
          description: "Вы можете добавить свой модификатор Интеллекта к урону одного заклинания воплощения."
        },
        {
          title: "Скульптурное заклинание",
          level: 6,
          description: "Вы можете создавать карманы относительной безопасности в своих заклинаниях воплощения."
        },
        {
          title: "Могущественное воплощение",
          level: 10,
          description: "Вы можете добавить свой модификатор Интеллекта к урону любого заклинания воплощения."
        },
        {
          title: "Перегрузка воплощения",
          level: 14,
          description: "Вы можете увеличить силу простых заклинаний воплощения."
        }
      ]
    }
  },
  "Воин": {
    "Мастер боевых искусств": {
      description: "Мастера боевых искусств совершенствуют свою технику ведения боя и оттачивают свои способности до уровня искусства.",
      features: [
        {
          title: "Боевое превосходство",
          level: 3,
          description: "Вы получаете особую способность использовать приёмы для дополнительных эффектов в бою."
        },
        {
          title: "Знаток оружия",
          level: 3,
          description: "Вы получаете владение одним ремесленным инструментом на свой выбор."
        },
        {
          title: "Дополнительный боевой стиль",
          level: 10,
          description: "Вы можете выбрать второй боевой стиль."
        },
        {
          title: "Улучшенное боевое превосходство",
          level: 18,
          description: "Ваши манёвры становятся более эффективными."
        }
      ]
    },
    "Чемпион": {
      description: "Чемпионы совершенствуют свои боевые способности до уровня совершенства. Это простые воины с исключительной боевой мощью.",
      features: [
        {
          title: "Улучшенный критический удар",
          level: 3,
          description: "Ваши атаки наносят критический удар при результате 19 или 20."
        },
        {
          title: "Примечательный атлет",
          level: 7,
          description: "Вы можете прыгать дальше, бежать быстрее и лазать лучше."
        },
        {
          title: "Дополнительный боевой стиль",
          level: 10,
          description: "Вы можете выбрать второй боевой стиль."
        },
        {
          title: "Превосходный критический удар",
          level: 15,
          description: "Ваши атаки наносят критический удар при результате 18–20."
        },
        {
          title: "Выживший",
          level: 18,
          description: "В начале своего хода вы восстанавливаете хиты, если у вас меньше половины хитов."
        }
      ]
    }
  }
};

// Функции для доступа к данным
export function getSubclassInfo(className: string, subclassName: string) {
  return subclassData[className]?.[subclassName] || null;
}

export function getSubclassesForClass(className: string) {
  return Object.keys(subclassData[className] || {});
}
