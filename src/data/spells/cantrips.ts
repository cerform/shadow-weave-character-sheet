
import { CharacterSpell } from '@/types/character';

export const cantrips: CharacterSpell[] = [
  {
    name: "Брызги кислоты",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы швыряете пузырь кислоты. Выберите одно существо, находящееся в пределах дистанции, или двух существ, находящихся в пределах дистанции и в пределах 5 футов друг от друга. Цель должна преуспеть в спасброске Ловкости, иначе получит урон кислотой 1к6. Урон этого заклинания увеличивается на 1к6, когда вы достигаете 5 уровня (2к6), 11 уровня (3к6) и 17 уровня (4к6).",
    classes: ["Волшебник", "Чародей"]
  },
  {
    name: "Власть над огнём",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "До 1 часа",
    description: "Вы создаёте один из следующих эффектов на выбор в пределах дистанции: вы мгновенно зажигаете свечу, факел или небольшой костёр; вы мгновенно тушите пламя размером с куб со стороной 1 фут; вы увеличиваете или уменьшаете яркость пламени на 1 час; вы можете создавать фигуры и формы из огня.",
    classes: ["Друид"]
  },
  {
    name: "Волшебная рука",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "1 минута",
    description: "Призрачная парящая рука появляется в точке, выбранной вами в пределах дистанции. Она существует, пока заклинание активно, или пока вы не отпустите её своим действием. Рука исчезает, если оказывается более чем в 30 футах от вас, или если вы накладываете это заклинание ещё раз.",
    classes: ["Бард", "Чародей", "Волшебник", "Колдун"]
  },
  {
    name: "Волшебный камень",
    level: 0,
    school: "Преобразование",
    castingTime: "1 бонусное действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "1 минута",
    description: "Вы касаетесь от одного до трёх камней и наполняете их магией. Если кто-то бросает такой камень, то попадает как дальнобойная атака заклинанием, нанося урон силовым полем 1к6. Бросающий добавляет ваш модификатор характеристики, отвечающей за заклинания, к броску атаки.",
    classes: ["Друид", "Искусственный"]
  },
  {
    name: "Вспышка мечей",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "5 футов",
    verbal: true,
    somatic: false,
    material: false,
    components: "В",
    duration: "Мгновенная",
    description: "Вы создаёте выпад мечом из силового поля. Совершите рукопашную атаку заклинанием против существа в пределах досягаемости. При попадании цель получает урон силовым полем 1к6, и должна преуспеть в спасброске Силы, иначе будет сбита с ног.",
    classes: ["Чародей", "Колдун", "Волшебник"]
  },
  {
    name: "Громовой клинок",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "5 футов",
    verbal: false,
    somatic: true,
    material: true,
    components: "С, М (оружие ближнего боя)",
    duration: "Мгновенная",
    description: "Вы создаёте временное силовое поле в форме клинка и совершаете им атаку заклинанием по существу в пределах досягаемости. При попадании цель получает урон силовым полем 1к10. Урон этого заклинания увеличивается на 1к10, когда вы достигаете 5 уровня (2к10), 11 уровня (3к10) и 17 уровня (4к10).",
    classes: ["Искусственный", "Колдун", "Волшебник"]
  },
  {
    name: "Дружба",
    level: 0,
    school: "Очарование",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: false,
    somatic: true,
    material: true,
    components: "С, М (небольшое количество макияжа, нанесённого на лицо)",
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Направьте на одно невраждебное существо, которое вы видите в пределах досягаемости. Если существо не может видеть вас, вы не оказываете на него никакого влияния. Если существо слышит вас и понимает ваш язык, оно должно преуспеть в спасброске Мудрости, иначе оно будет очаровано вами, пока заклинание не закончится. Пока существо очаровано, оно относится к вам как к другу.",
    classes: ["Бард", "Чародей", "Колдун"]
  },
  {
    name: "Дубинка",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (веточка любого дерева)",
    duration: "1 минута",
    description: "Деревянная дубинка, которую вы держите, наполняется силой. До окончания заклинания вы можете использовать её для совершения рукопашных атак. Если вы попадаете, цель получает урон дробящим 1к6. Вдобавок, цель должна преуспеть в спасброске Силы, иначе будет отброшена на 10 футов от вас.",
    classes: ["Друид"]
  },
  {
    name: "Защита от оружия",
    level: 0,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "1 раунд",
    description: "Вы касаетесь одного желающего существа и даруете ему защиту. До начала вашего следующего хода цель получает бонус +5 к КД, в том числе и от спровоцированных атак.",
    classes: ["Жрец"]
  },
  {
    name: "Злая насмешка",
    level: 0,
    school: "Очарование",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: false,
    material: false,
    components: "В",
    duration: "1 минута",
    description: "Вы выбираете одно существо, которое видите в пределах досягаемости, и осыпаете его магическими насмешками. Если цель слышит вас (хотя она не обязана понимать вас), она должна преуспеть в спасброске Мудрости, иначе получит психический урон 1к4, и совершает броски атаки до конца своего следующего хода с помехой.",
    classes: ["Бард"]
  },
  {
    name: "Искусство друидов",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте один из следующих эффектов на выбор в пределах дистанции: вы мгновенно создаёте небольшой, безвредный зрительный или слуховой эффект, например, лист, падающий с ветки, мелодию малиновки или запах скунса; вы мгновенно зажигаете или тушите свечу, факел или небольшой костёр; вы мгновенно очищаете небольшой предмет от грязи; вы мгновенно охлаждаете, нагреваете или меняете цвет куба воды со стороной 1 фут на 1 час.",
    classes: ["Друид"]
  },
  {
    name: "Иссушающий укол",
    level: 0,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Совершите рукопашную атаку заклинанием по существу в пределах досягаемости. При попадании цель получает урон некротической энергией 1к8, и вы получаете хиты, равные половине причинённого урона.",
    classes: ["Колдун"]
  },
  {
    name: "Клинок зелёного пламени",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "5 футов",
    verbal: false,
    somatic: true,
    material: true,
    components: "С, М (оружие ближнего боя)",
    duration: "Мгновенная",
    description: "Вы создаёте временное силовое поле в форме клинка и совершаете им атаку заклинанием по существу в пределах досягаемости. При попадании цель получает обычный урон от оружия, и зелёное пламя перескакивает на другое существо в пределах 5 футов от цели. Второе существо должно преуспеть в спасброске Ловкости, иначе получит урон огнём, равный вашему модификатору характеристики, отвечающей за заклинания.",
    classes: ["Искусственный", "Волшебник"]
  },
  {
    name: "Кодировка мыслей",
    level: 0,
    school: "Очарование",
    castingTime: "1 действие",
    range: "Касание",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "8 часов",
    description: "Вы касаетесь одного желающего существа и безопасно кодируете в его разуме одно сообщение, состоящее не более чем из двадцати пяти слов. Только вы и цель можете получить сообщение. Любой, кто попытается прочитать мысли цели, получит только бессмысленный набор слов.",
    classes: ["Бард", "Волшебник"]
  },
  {
    name: "Лассо молнии",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: false,
    material: false,
    components: "В",
    duration: "Мгновенная",
    description: "Вы выпускаете луч молнии в одно существо, которое видите в пределах досягаемости. Цель должна преуспеть в спасброске Силы, иначе будет притянута на 10 футов к вам.",
    classes: ["Чародей"]
  },
  {
    name: "Леденящее прикосновение",
    level: 0,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "1 раунд",
    description: "Совершите рукопашную атаку заклинанием по существу в пределах досягаемости. При попадании цель получает урон холодом 1к8, и не может восстанавливать хиты до начала вашего следующего хода.",
    classes: ["Колдун", "Волшебник"]
  },
  {
    name: "Лепка земли",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "Мгновенная или 1 минута",
    description: "Вы выбираете участок земли, который видите в пределах досягаемости, и который помещается в куб со стороной 5 футов. Вы создаёте один из следующих эффектов на выбор: если вы целитесь в рыхлую землю, вы можете мгновенно вырыть её, переместить или заполнить; вы можете придать земле простые формы и фигуры, и сохранить их на 1 минуту.",
    classes: ["Друид"]
  },
  {
    name: "Луч холода",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы выпускаете луч морозной энергии в одно существо, которое видите в пределах досягаемости. Совершите дальнобойную атаку заклинанием. При попадании цель получает урон холодом 1к8, и её скорость уменьшается на 10 футов до начала вашего следующего хода.",
    classes: ["Чародей", "Волшебник"]
  },
  {
    name: "Малая иллюзия",
    level: 0,
    school: "Иллюзия",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: false,
    somatic: true,
    material: true,
    components: "С, М (клочок шерсти или стекла)",
    duration: "1 минута",
    description: "Вы создаёте звук или образ предмета в пределах дистанции, длящийся, пока активно заклинание. Иллюзия должна помещаться в куб со стороной 5 фт. Иллюзия включает в себя ваши чувства, но не может быть больше, чем вы можете вместить в куб со стороной 5 фт. Вы можете использовать своё действие, чтобы заставить звук или образ повторяться, изменяя его, или перемещая в другое место в пределах дистанции.",
    classes: ["Бард", "Колдун", "Волшебник"]
  },
  {
    name: "Меткий удар",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "Мгновенная",
    description: "Вы создаёте луч чистой энергии, который обрушивается на врага. Совершите дальнобойную атаку заклинанием. При попадании цель получает урон излучением 1к10. Если цель — нежить или демон, она совершает спасбросок Телосложения. В случае провала цель становится ослеплённой до конца вашего следующего хода.",
    classes: ["Жрец"]
  },
  {
    name: "Мистический заряд",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "120 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте луч тёмной энергии и бросаете его в одно существо в пределах дистанции. Совершите дальнобойную атаку заклинанием. При попадании цель получает урон силовым полем 1к10.",
    classes: ["Колдун"]
  },
  {
    name: "Нашествие",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (горсть песка, щепотка земли и капля воды)",
    duration: "Мгновенная",
    description: "Вы создаёте небольшое землетрясение в точке, которую видите в пределах дистанции. Каждое существо, находящееся в пределах 5 футов от этой точки, должно преуспеть в спасброске Телосложения, иначе будет сбито с ног.",
    classes: ["Чародей", "Друид", "Волшебник"]
  },
  {
    name: "Обморожение",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте конус холода в точке, которую видите в пределах дистанции. Каждое существо, находящееся в пределах 5 футов от этой точки, должно преуспеть в спасброске Телосложения, иначе получит урон холодом 1к6, и не сможет совершать реакции до начала вашего следующего хода.",
    classes: ["Друид", "Волшебник"]
  },
  {
    name: "Огненный снаряд",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "120 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте сноп пламени и бросаете его в одно существо в пределах дистанции. Совершите дальнобойную атаку заклинанием. При попадании цель получает урон огнём 1к10.",
    classes: ["Чародей", "Волшебник"]
  },
  {
    name: "Первобытная дикость",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "На себя",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы наполняетесь первобытной энергией. До окончания заклинания вы можете использовать своё действие, чтобы совершить рукопашную атаку заклинанием. При попадании цель получает урон кислотой, холодом, огнём, электричеством или ядом (на ваш выбор) 1к6.",
    classes: ["Друид"]
  },
  {
    name: "Пляшущие огоньки",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "120 футов",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (немного светлячков или гнилушек)",
    duration: "1 минута",
    description: "Вы создаёте до четырёх огоньков в пределах дистанции. Они выглядят как факелы, фонари или светящиеся шары, по вашему выбору. Огоньки светят ярким светом в радиусе 10 футов и тусклым светом ещё на 10 футов. Вы можете бонусным действием переместить огоньки на расстояние до 60 футов. Огоньки должны оставаться в пределах 120 футов от вас.",
    classes: ["Бард", "Волшебник"]
  },
  {
    name: "Погребальный звон",
    level: 0,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы направляете тёмную энергию в одно существо, которое видите в пределах досягаемости, которое имеет не более полных хитов. Цель должна преуспеть в спасброске Телосложения, иначе получит урон некротической энергией 1к8. Если цель — нежить, она совершает спасбросок с помехой.",
    classes: ["Жрец", "Колдун", "Волшебник"]
  },
  {
    name: "Починка",
    level: 0,
    school: "Преобразование",
    castingTime: "1 минута",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (магнит и немного меди)",
    duration: "Мгновенная",
    description: "Это заклинание восстанавливает повреждения предмета, которого вы касаетесь. Если предмет сломан, но не уничтожен, вы можете восстановить его до прежнего состояния. Заклинание может физически восстановить кусок предмета, не превышающий 1 фут в любом измерении.",
    classes: ["Бард", "Жрец", "Волшебник", "Искусственный"]
  },
  {
    name: "Раскат грома",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "На себя (10-футовый радиус)",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "Мгновенная",
    description: "Вы создаёте оглушительный раскат грома, слышимый на расстоянии до 300 футов. Каждое существо в пределах 10 футов от вас должно совершить спасбросок Телосложения. В случае провала существо получает урон звуком 1к8, а в случае успеха — половину этого урона.",
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    name: "Расщепление разума",
    level: 0,
    school: "Очарование",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: false,
    material: false,
    components: "В",
    duration: "1 раунд",
    description: "Вы вторгаетесь в разум одного существа, которое видите в пределах досягаемости. Цель должна преуспеть в спасброске Интеллекта, иначе получит урон психической энергией 1к6, и совершает броски атаки до конца своего следующего хода с помехой.",
    classes: ["Колдун"]
  },
  {
    name: "Свет",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: false,
    material: true,
    components: "В, М (светлячок или светящийся мох)",
    duration: "1 час",
    description: "Вы касаетесь одного предмета, который не больше 10 футов в любом измерении. До окончания заклинания предмет излучает яркий свет в радиусе 20 футов и тусклый свет ещё на 20 футов. Свет может быть любого цвета, на ваш выбор. Заклинание заканчивается, если вы накладываете его ещё раз, или если вы отменяете его действием.",
    classes: ["Бард", "Жрец", "Паладин", "Чародей", "Волшебник", "Искусственный"]
  },
  {
    name: "Священное пламя",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "На существо, которое вы видите в пределах досягаемости, нисходит божественный огонь. Цель должна совершить спасбросок Ловкости, иначе получит урон излучением 1к8. Цель не получает укрытия от этого урона.",
    classes: ["Жрец"]
  },
  {
    name: "Слово сияния",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    material: true,
    components: "В, М (святой символ)",
    duration: "Мгновенная",
    description: "Вы произносите божественное слово, и яркий свет исходит от вас. Каждое существо, находящееся в пределах 5 футов от вас, должно совершить спасбросок Телосложения. В случае провала существо получает урон излучением 1к6, а в случае успеха — половину этого урона.",
    classes: ["Жрец"]
  },
  {
    name: "Сообщение",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "120 футов",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (кусочек медной проволоки)",
    duration: "1 раунд",
    description: "Вы передаёте шёпотом сообщение одному существу в пределах дистанции. Цель слышит вас, и может ответить шёпотом. Только вы двое можете слышать это сообщение.",
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    name: "Сопротивление",
    level: 0,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (миниатюрная накидка)",
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы касаетесь одного желающего существа. Один раз до окончания заклинания цель может добавить к спасброску к4.",
    classes: ["Жрец", "Друид"]
  },
  {
    name: "Сотворение костра",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы создаёте костёр на земле в точке, которую видите в пределах дистанции. Костёр занимает квадрат со стороной 5 футов. Каждое существо, заканчивающее свой ход в пределах костра, должно преуспеть в спасброске Ловкости, иначе получит урон огнём 1к8.",
    classes: ["Друид", "Волшебник", "Следопыт"]
  },
  {
    name: "Сотворение пламени",
    level: 0,
    school: "Вызов",
    castingTime: "1 действие",
    range: "60 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте сноп пламени и бросаете его в одно существо в пределах дистанции. Совершите дальнобойную атаку заклинанием. При попадании цель получает урон огнём 1к10.",
    classes: ["Друид", "Жрец"]
  },
  {
    name: "Терновый кнут",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: true,
    material: true,
    components: "В, С, М (стебель растения)",
    duration: "Мгновенная",
    description: "Вы создаёте длинный терновый кнут, который хлещет одно существо в пределах дистанции. Совершите рукопашную атаку заклинанием. При попадании цель получает урон колющим 1к6, и если цель большая или меньше, вы можете притянуть её на 10 футов к себе.",
    classes: ["Друид"]
  },
  {
    name: "Указание",
    level: 0,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы касаетесь одного желающего существа. Один раз до окончания заклинания цель может добавить к проверке характеристики к4.",
    classes: ["Жрец"]
  },
  {
    name: "Уход за умирающим",
    level: 0,
    school: "Ограждение",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы касаетесь одного живого существа, находящегося в состоянии смерти. Цель стабилизируется.",
    classes: ["Жрец"]
  },
  {
    name: "Фокусы",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "10 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте один из следующих эффектов на выбор в пределах дистанции: вы мгновенно создаёте небольшой, безвредный зрительный или слуховой эффект, например, лист, падающий с ветки, мелодию малиновки или запах скунса; вы мгновенно зажигаете или тушите свечу, факел или небольшой костёр; вы мгновенно очищаете небольшой предмет от грязи; вы мгновенно охлаждаете, нагреваете или меняете цвет куба воды со стороной 1 фут на 1 час.",
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    name: "Формование воды",
    level: 0,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: false,
    somatic: true,
    material: false,
    components: "С",
    duration: "Мгновенная или 1 час",
    description: "Вы выбираете участок воды, который видите в пределах досягаемости, и который помещается в куб со стороной 5 футов. Вы создаёте один из следующих эффектов на выбор: вы мгновенно перемещаете воду в другое место в пределах дистанции; вы придаёте воде простые формы и фигуры, и сохраняете их на 1 час; вы замораживаете воду, если температура достаточно низкая.",
    classes: ["Друид", "Волшебник"]
  },
  {
    name: "Чудотворство",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    material: false,
    components: "В",
    duration: "Мгновенная",
    description: "Вы просите своё божество о помощи. Вы создаёте один из следующих эффектов на выбор в пределах дистанции: вы мгновенно создаёте небольшой, безвредный зрительный или слуховой эффект, например, лист, падающий с ветки, мелодию малиновки или запах скунса; вы мгновенно зажигаете или тушите свечу, факел или небольшой костёр; вы мгновенно очищаете небольшой предмет от грязи; вы мгновенно охлаждаете, нагреваете или меняете цвет куба воды со стороной 1 фут на 1 час.",
    classes: ["Жрец"]
  },
  {
    name: "Шквал",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "30 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы создаёте порыв ветра, который сбивает с ног небольшие предметы и существ. Каждое существо в пределах 10 футов от вас должно совершить спасбросок Силы. В случае провала существо отбрасывается на 5 футов от вас.",
    classes: ["Друид", "Чародей", "Волшебник"]
  },
  {
    name: "Электрошок",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Касание",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Совершите рукопашную атаку заклинанием по существу в пределах досягаемости. При попадании цель получит урон электричеством 1к8, и не сможет совершать реакции до начала своего следующего хода.",
    classes: ["Чародей", "Волшебник"]
  },
  {
    name: "Ядовитые брызги",
    level: 0,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "10 футов",
    verbal: true,
    somatic: true,
    material: false,
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы протягиваете руку к существу, которое видите в пределах дистанции, и выпускаете из своей ладони облачко ядовитого газа. Существо должно преуспеть в спасброске Телосложения, иначе получит урон ядом 1к12.",
    classes: ["Друид", "Чародей", "Волшебник"]
  }
];
