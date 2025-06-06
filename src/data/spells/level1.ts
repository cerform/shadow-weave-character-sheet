import { CharacterSpell } from '@/types/character';

export const level1: CharacterSpell[] = [
  {
    id: "level1-1",
    name: "Адское возмездие",
    level: 1,
    school: "Воплощение",
    castingTime: "1 реакция, которую вы совершаете в ответ на получение урона от существа в пределах 60 футов от вас",
    range: "60 футов",
    components: "В, С",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    duration: "Мгновенная",
    description: "Вы указываете пальцем, и существо, причинившее вам урон, на мгновение окружается адским пламенем. Цель должна совершить спасбросок Ловкости. Она получает 2к10 урона огнём при провале, или половину этого урона при успехе.",
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку 2 уровня или выше, урон увеличивается на 1к10 за каждый уровень ячейки выше 1.",
    classes: ["Волшебник", "Колдун", "Искуситель"]
  },
  {
    id: "level1-2",
    name: "Безмолвный образ",
    level: 1,
    school: "Иллюзия",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В, С, М",
    verbal: true,
    somatic: true,
    material: true,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 10 минут",
    description: "Вы создаёте образ предмета, существа или другого видимого явления, размером не больше куба с длиной ребра 15 футов. Образ появляется в точке, которую вы видите в пределах дистанции, и длится, пока заклинание активно. Этот образ — исключительно визуальный; он не сопровождается звуками, запахами и прочими сенсорными эффектами. Вы можете действием заставить образ переместиться в любое место в пределах дистанции. Физическое взаимодействие с образом показывает его иллюзорность, так как предметы проходят сквозь него. Существо, использующее действие для изучения образа, может определить, что это иллюзия, при успешной проверке Интеллекта (Расследование) против Сл ваших заклинаний. Если существо распознало иллюзию, оно может видеть сквозь образ.",
    classes: ["Бард", "Волшебник", "Чародей"]
  },
  {
    id: "level1-3",
    name: "Благословение",
    level: 1,
    school: "Очарование",
    castingTime: "1 действие",
    range: "30 футов",
    components: "В, С, М",
    verbal: true,
    somatic: true,
    material: true,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы благословляете до трёх существ на ваш выбор в пределах дистанции. Если цель совершает бросок атаки или спасбросок до окончания заклинания, она может бросить к4 и добавить выпавшее число к результату броска атаки или спасброска.",
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку 2 уровня или выше, вы можете выбрать целью одно дополнительное существо за каждый уровень ячейки выше 1.",
    classes: ["Жрец", "Паладин"]
  },
  {
    id: "level1-4",
    name: "Божественное благоволение",
    level: 1,
    school: "Воплощение",
    castingTime: "1 бонусное действие",
    range: "На себя",
    components: "В, С",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Ваша молитва даёт вам силу. До окончания заклинания ваши атаки оружием причиняют дополнительный урон 1к4 излучением при попадании.",
    classes: ["Жрец", "Паладин"]
  },
  {
    id: "level1-5",
    name: "Ведьмин снаряд",
    level: 1,
    school: "Воплощение",
    castingTime: "1 бонусное действие",
    range: "Касание",
    components: "В, С, М",
    verbal: true,
    somatic: true,
    material: true,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 часа",
    description: "Оружие, которого вы касаетесь, становится магическим. До окончания действия заклинания это оружие наносит дополнительный урон некротической энергией 1к6 при попадании.",
    classes: ["Колдун"]
  },
  {
    id: "level1-6",
    name: "Волна грома",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "На себя (15-футовый куб)",
    components: "В, С",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    duration: "Мгновенная",
    description: "Волна громового звука распространяется от вас. Все существа в пределах 15-футового куба с центром на вас должны совершить спасбросок Телосложения. При провале существо получает 2к8 урона звуком и толкается на 10 футов от вас. При успехе существо получает половину урона и не толкается. Кроме того, незакреплённые предметы, полностью находящиеся в области воздействия, автоматически толкаются на 10 футов от вас, и заклинание издаёт громовой звук, слышимый на расстоянии в 300 футов.",
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку 2 уровня или выше, урон увеличивается на 1к8 за каждый уровень ячейки выше 1.",
    classes: ["Бард", "Друид", "Чародей", "Волшебник"]
  },
  {
    id: "level1-7",
    name: "Волшебная стрела",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    duration: "Мгновенная",
    description: "Вы создаёте три светящиеся стрелы из силового поля. Каждая стрела попадает в существо на ваш выбор, которое вы видите в пределах дистанции. Стрела причиняет цели урон силовым полем 1к4 + 1. Стрелы бьют одновременно, и вы можете направить их в одну или несколько целей.",
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку 2 уровня или выше, заклинание создаёт одну дополнительную стрелу за каждый уровень ячейки выше 1.",
    classes: ["Волшебник", "Чародей"]
  },
  {
    id: "level1-8",
    name: "Волшебная стрела Джима",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "В, С, М",
    verbal: true,
    somatic: true,
    material: true,
    ritual: false,
    duration: "Мгновенная",
    description: "Волшебная стрела с непредсказуемыми свойствами. При попадании наносит 2к4 урона силовым полем + 1к4 урона дополнительного типа (кислота, холод, огонь, сила или электричество) со случайными визуальными эффектами.",
    classes: ["Волшебник"]
  },
  {
    id: "level1-9",
    name: "Вызов на дуэль",
    level: 1,
    school: "Очарование",
    castingTime: "1 бонусное действие",
    range: "60 футов",
    components: "В",
    verbal: true,
    somatic: false,
    material: false,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы произносите вызов, принуждающий существо сразиться с вами. Одно существо, которое вы видите в пределах дистанции, должно совершить спасбросок Мудрости. При провале оно очаровано вами, пока заклинание активно или пока вы или ваши спутники не причините ему вред.",
    classes: ["Паладин"]
  },
  {
    id: "level1-10",
    name: "Вызов страха",
    level: 1,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В",
    verbal: true,
    somatic: false,
    material: false,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы пробуждаете кошмары в существе, видимом в пределах дистанции. Цель должна преуспеть в спасброске Мудрости, иначе станет испуганной до окончания заклинания. Цель, ставшая испуганной, должна в свой ход совершать действие Рывок и перемещаться прочь от вас кратчайшим и безопасным путём, если только ей некуда идти. Если оно успешно совершает спасбросок, оно не совершает новые спасброски от этого заклинания. Заклинание оканчивается, если вы атакуете другое существо, накладываете заклинание на другое существо, если существо не может больше вас слышать, или если вы окажетесь недееспособны.",
    classes: ["Бард", "Колдун", "Волшебник"]
  },
  {
    id: "level1-11",
    name: "Героизм",
    level: 1,
    school: "Очарование",
    castingTime: "1 действие",
    range: "Касание",
    components: "В, С",
    verbal: true,
    somatic: true,
    material: false,
    ritual: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Согласное существо, которого вы касаетесь, наполняется храбростью. До окончания заклинания существо получает временные хиты в количестве, равном вашему модификатору базовой характеристики, в начале каждого своего хода. Кроме того, пока заклинание активно, существо совершает с преимуществом спасброски от состояния испуганный.",
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку 2 уровня или выше, вы можете сделать целью одно дополнительное существо за каждый уровень ячейки выше 1.",
    classes: ["Бард", "Паладин"]
  },
  {
    id: "level1-12",
    name: "Огненные ладони",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "Конус 15 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    duration: "Мгновенная",
    description: "Вы вытягиваете ладони перед собой, большие пальцы соприкасаются, а пальцы разведены в стороны, выпуская тонкий лист пламени. Все существа в конусе 15 футов должны совершить спасбросок Ловкости. При провале существо получает урон огнём 3к6, или половину этого урона при успехе.",
    classes: ["Волшебник", "Чародей"],
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку заклинания 2 уровня или выше, урон увеличивается на 1к6 за каждый уровень ячейки выше 1."
  },
  {
    id: "level1-13",
    name: "Огонь фей",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В",
    verbal: true,
    somatic: false,
    material: true,
    ritual: true,
    duration: "Мгновенная",
    description: "Каждый объект в кубе с радиусом 20 футов в пределах дистанции освещается синим, зелёным или фиолетовым светом (на ваш выбор). Все существа в этой области при первом входе в неё в течение хода или при окончании здесь своего хода должны совершить спасбросок Ловкости. При провале существо получает урон огнём 1к10.",
    classes: ["Друид", "Чародей", "Волшебник", "Колдун"],
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку заклинания 2 уровня или выше, урон увеличивается на 1к10 за каждый уровень ячейки выше 1."
  },
  {
    id: "level1-14",
    name: "Опознание",
    level: 1,
    school: "Прорицание",
    castingTime: "1 минута",
    range: "Касание",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "Мгновенная",
    description: "Вы выбираете один предмет, который должны держать в течение всего накладывания заклинания. Если это магический предмет или другой предмет, наполненный магией, вы узнаёте его свойства и способы их использования, известны ли ему заклинания, и сколько у него осталось зарядов, если они есть.",
    classes: ["Бард", "Волшебник"]
  },
  {
    id: "level1-15",
    name: "Опутывание",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "90 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "В квадрате со стороной 20 футов с центром в точке в пределах дистанции прорастают цепкие сорняки и плети. На время действия заклинания эти растения превращают землю в этой области в труднопроходимую местность. Существа, находящиеся в этой области, когда вы накладывали заклинание, должны преуспеть в спасброске Силы, иначе они будут опутаны растениями.",
    classes: ["Друид", "Следопыт"]
  },
  {
    id: "level1-16",
    name: "Опутывающий удар",
    level: 1,
    school: "Преобразование",
    castingTime: "1 бонусное действие",
    range: "На себя",
    components: "В",
    verbal: true,
    somatic: false,
    material: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "В следующий раз, когда вы попадёте по существу рукопашной атакой оружием до окончания действия этого заклинания, цель должна совершить спасбросок Силы, иначе она станет опутанной, пока заклинание не окончится. Существо может повторять спасбросок в конце каждого своего хода, оканчивая эффект на себе при успехе.",
    classes: ["Следопыт"]
  },
  {
    id: "level1-17",
    name: "Очарование личности",
    level: 1,
    school: "Очарование",
    castingTime: "1 действие",
    range: "30 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    ritual: true,
    duration: "1 час",
    description: "Вы пытаетесь очаровать гуманоида, которого видите в пределах дистанции. Он должен совершить спасбросок Мудрости, и с преимуществом, если вы или ваши спутники сражаетесь с ним. При провале он очарован вами, пока заклинание активно или пока вы или ваши спутники не причините ему вред.",
    classes: ["Бард", "Друид", "Чародей", "Колдун", "Волшебник"]
  },
  {
    id: "level1-18",
    name: "Очищение пищи и питья",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "10 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "Мгновенная",
    description: "Вся немагическая еда и питьё в сфере с радиусом 5 футов с центром на точке, выбранной вами в пределах дистанции, очищаются от ядов и болезней.",
    classes: ["Друид", "Жрец", "Паладин"]
  },
  {
    id: "level1-19",
    name: "Падение пёрышком",
    level: 1,
    school: "Преобразование",
    castingTime: "1 реакция",
    range: "60 футов",
    components: "ВМ",
    verbal: true,
    somatic: false,
    material: true,
    duration: "1 минута",
    description: "Выберите до пяти падающих существ в пределах дистанции. Скорость падения этих существ уменьшается до 60 футов в раунд, пока заклинание активно. Если существо приземляется до окончания заклинания, оно не получает урона от падения и приземляется стоя, а заклинание оканчивается для этого существа.",
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    id: "level1-20",
    name: "Палящая кара",
    level: 1,
    school: "Воплощение",
    castingTime: "1 бонусное действие",
    range: "На себя",
    components: "В",
    verbal: true,
    somatic: false,
    material: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "В следующий раз, когда вы попадёте по существу рукопашной атакой, ваше оружие вспыхивает огнём, нанося при попадании дополнительный урон огнём 1к6. Заклинание заканчивается после этого, или если вы отпустите оружие.",
    classes: ["Паладин"]
  },
  {
    id: "level1-21",
    name: "Поглощение стихий",
    level: 1,
    school: "Ограждение",
    castingTime: "1 реакция",
    range: "На себя",
    components: "С",
    verbal: false,
    somatic: true,
    material: false,
    duration: "1 раунд",
    description: "Заклинание действует, когда вы получаете урон кислотой, холодом, огнём, электричеством или звуком. У вас появляется сопротивление к вызвавшему его урону до начала вашего следующего хода, включая срабатывающий урон. Кроме того, когда вы в первый раз после накладывания этого заклинания попадаете рукопашной атакой, цель получает дополнительный урон 1к6 того же вида.",
    classes: ["Друид", "Следопыт", "Волшебник"]
  },
  {
    id: "level1-22",
    name: "Поиск фамильяра",
    level: 1,
    school: "Вызов",
    castingTime: "1 час",
    range: "10 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "Мгновенная",
    description: "Вы получаете услуги фамильяра, духа, принимающего животную форму на ваш выбор: летучая мышь, жаба, кошка, краб, ворон, хорёк, морской конёк, ящерица, осьминог, сова, ядовитая змея, рыба (рыба-собака), крыса, ворон или креветка. Фамильяр появляется в незанятом пространстве в пределах дистанции и обладает характеристиками выбранной формы, хотя на самом деле это не животное, а небесный, фея или исчадие (на ваш выбор).",
    classes: ["Волшебник"]
  },
  {
    id: "level1-23",
    name: "Понимание языков",
    level: 1,
    school: "Прорицание",
    castingTime: "1 действие",
    range: "На себя",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "1 час",
    description: "На время действия заклинания вы понимаете буквальное значение всех произносимых на языках, которые вы слышите. Вы также понимаете написанное на всех языках, которые видите, но должны касаться поверхности, на которой написаны слова. Требуется примерно минута для прочтения одной страницы текста.",
    classes: ["Бард", "Чародей", "Колдун", "Волшебник"]
  },
  {
    id: "level1-24",
    name: "Порча",
    level: 1,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "60 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    concentration: true,
    duration: "Концентрация, вплоть до 1 часа",
    description: "Вы накладываете проклятье на существо в пределах дистанции. Пока заклинание активно, вы причиняете дополнительный урон некротической энергией 1к6 каждый раз, когда попадаете по цели атакой. Также, выберите одну характеристику: цель совершает проверки с этой характеристикой с помехой. Каждый раз, когда вы или союзник попадает по проклятой цели атакой, заклинание не заканчивается.",
    classes: ["Колдун"]
  },
  {
    id: "level1-25",
    name: "Поспешное отступление",
    level: 1,
    school: "Преобразование",
    castingTime: "1 бонусное действие",
    range: "На себя",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    concentration: true,
    duration: "Концентрация, вплоть до 10 минут",
    description: "Это заклинание позволяет вам передвигаться с невероятной скоростью. Когда вы накладываете это заклинание, а затем в качестве бонусного действия в каждом последующем ходе до окончания действия заклинания, вы можете совершать действие Отход. В свой ход вы также увеличиваете свою скорость ходьбы в два раза.",
    classes: ["Волшебник", "Чародей", "Колдун"]
  },
  {
    id: "level1-26",
    name: "Приказ",
    level: 1,
    school: "Очарование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В",
    verbal: true,
    somatic: false,
    material: false,
    ritual: false,
    duration: "1 раунд",
    description: "Вы произносите одно слово — команду существу, которое вы можете видеть в пределах дистанции. Цель должна преуспеть в спасброске Мудрости, иначе она выполняет приказ в свой следующий ход. Заклинание не оказывает никакого эффекта, если цель — нежить, если она не понимает ваш язык, или если ваш приказ напрямую вредит ей.",
    classes: ["Жрец", "Паладин"]
  },
  {
    id: "level1-27",
    name: "Притяжение",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    duration: "1 раунд",
    description: "Вы можете переместить предмет весом до 5 фунтов, который никто не несёт и не носит. Вы можете притянуть предмет к себе со скоростью 30 футов в ход. Если предмет находится на малом или крошечном существе, которое не хочет отдавать предмет, это существо должно преуспеть в спасброске Силы, иначе предмет улетит к вам.",
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    id: "level1-28",
    name: "Прыжок",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "Касание",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "1 минута",
    description: "Вы касаетесь существа. Дистанция прыжков существа утраивается, пока заклинание активно.",
    classes: ["Друид", "Волшебник", "Следопыт", "Искуситель"]
  },
  {
    id: "level1-29",
    name: "Псевдожизнь",
    level: 1,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "На себя",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "1 час",
    description: "Защитная магическая сила окружает вас, проявляясь в виде призрачной изморози, и вы получаете 1к4 + 4 временных хита на время действия заклинания.",
    classes: ["Волшебник"],
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку заклинания 2 уровня или выше, вы получаете 5 дополнительных временных хитов за каждый уровень ячейки выше 1."
  },
  {
    id: "level1-30",
    name: "Разговор с животными",
    level: 1,
    school: "Прорицание",
    castingTime: "1 действие",
    range: "На себя",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    ritual: true,
    duration: "10 минут",
    description: "Вы получаете способность понимать зверей и вербально общаться с ними на время действия заклинания. Знания и уровень интеллекта многих зверей ограничивают темы, на которые вы можете с ними говорить, но они могут рассказать вам о ближайших местах или монстрах, или о том, что они воспринимали за последний день.",
    classes: ["Бард", "Друид", "Следопыт"]
  },
  {
    id: "level1-31",
    name: "Руки Хадара",
    level: 1,
    school: "Вызов",
    castingTime: "1 действие",
    range: "На себя",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    duration: "Мгновенная",
    description: "Вы создаёте щупальца кромешной тьмы, которые ненадолго вырываются из вас. Все существа по вашему выбору, которых вы можете видеть в пределах 10 футов от вас, должны совершить спасбросок Силы. При провале цель получает урон некротической энергией 2к6 и не может совершать реакции до своего следующего хода. При успехе она получает половину этого урона.",
    classes: ["Колдун"]
  },
  {
    id: "level1-32",
    name: "Сверкающие брызги",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "Мгновенная",
    description: "Сверкающая цветная пыль осыпает всех в кубе с ребром 10 футов в пределах дистанции. Все существа в этой области должны преуспеть в спасброске Телосложения, иначе они станут ослеплёнными. Существо, ставшее слепым из-за этого заклинания, совершает спасбросок Телосложения в конце каждого своего хода. При успехе оно перестаёт быть ослеплённым.",
    classes: ["Бард", "Чародей", "Волшебник"]
  },
  {
    id: "level1-33",
    name: "Сглаз",
    level: 1,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "60 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    concentration: true,
    duration: "Концентрация, вплоть до 1 часа",
    description: "Вы накладываете проклятье на существо в пределах дистанции. Пока заклинание активно, вы причиняете дополнительный урон некротической энергией 1к6 каждый раз, когда попадаете по цели атакой. Также, выберите одну характеристику: цель совершает проверки с этой характеристикой с помехой. Каждый раз, когда вы или союзник попадает по проклятой цели атакой, заклинание не заканчивается.",
    classes: ["Колдун"]
  },
  {
    id: "level1-34",
    name: "Сигнал тревоги",
    level: 1,
    school: "Ограждение",
    castingTime: "1 минута",
    range: "30 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "8 часов",
    description: "Вы устанавливаете сигнализацию против нежелательных вторжений. Выберите дверь, окно, или область в пределах дистанции не более куба с ребром 20 футов. До окончания действия заклинания тревога предупреждает вас, когда Крошечное или более большое существо касается охраняемой области или входит в неё. При накладывании заклинания вы можете указать существ, которые не будут провоцировать срабатывание тревоги.",
    classes: ["Следопыт", "Волшебник"]
  },
  {
    id: "level1-35",
    name: "Силок",
    level: 1,
    school: "Преобразование",
    castingTime: "1 минута",
    range: "Касание",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "8 часов",
    description: "Вы создаёте ловушку, которая связывает существо, пересекающее определённую область. Выбранная вами область не может превышать куб с ребром 5 футов, и вы должны иметь компонент на сумму не менее 25 зм, который расходуется при накладывании заклинания. Цель должна совершить спасбросок Ловкости. Те, кто проваливает спасбросок, становятся опутанными, пока не освободятся.",
    classes: ["Друид", "Следопыт", "Волшебник"]
  },
  {
    id: "level1-36",
    name: "Скольжение",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "1 минута",
    description: "Покрывает поверхность маслянистой грязью, превращая местность в пределах квадрата с размером 10 футов в труднопроходимую. Все существа, входящие в область или начинающие там ход, должны преуспеть в спасброске Ловкости, иначе они падают ничком. Существа, которые должны пересечь эту область, преуспевают в спасброске автоматически.",
    classes: ["Волшебник", "Чародей"]
  },
  {
    id: "level1-37",
    name: "Скороход",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "Касание",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "1 минута",
    description: "Вы касаетесь существа. Скорость существа увеличивается на 10 футов, пока заклинание активно.",
    classes: ["Бард", "Друид", "Волшебник", "Следопыт", "Искуситель"]
  },
  {
    id: "level1-38",
    name: "Снаряд хаоса",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "120 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    duration: "Мгновенная",
    description: "Вы метаете переливающийся сгусток энергии в существо в пределах дистанции. Совершите дальнобойную атаку заклинанием по цели. При попадании цель получает 2к8 + 1к6 урона. Выберите один из к8 — результат этого кубика определяет вид урона: 1 = кислота, 2 = холод, 3 = огонь, 4 = электричество, 5 = яд, 6 = психический урон, 7 = звук, 8 = силовое поле. Если выпадет одинаковое число на обоих к8, энергия попадает в точку рядом с целью, и она не получает урон от к6.",
    classes: ["Чародей", "Волшебник"],
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку заклинания 2 уровня или выше, урон увеличивается на 1к6 за каждый уровень ячейки выше 1."
  },
  {
    id: "level1-39",
    name: "Сотворение или уничтожение воды",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "30 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "Мгновенная",
    description: "Вы либо создаёте, либо уничтожаете воду. Сотворение воды: Вы создаёте до 10 галлонов чистой воды в открытом контейнере в пределах дистанции. В качестве альтернативы, вода выпадает дождём в кубе с длиной ребра 30 футов, гася открытый огонь в этой области. Уничтожение воды: Вы уничтожаете до 10 галлонов воды в открытом контейнере в пределах дистанции.",
    classes: ["Друид", "Жрец"]
  },
  {
    id: "level1-40",
    name: "Тензеров парящий диск",
    level: 1,
    school: "Вызов",
    castingTime: "1 действие",
    range: "30 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "1 час",
    description: "Это заклинание создаёт круглую горизонтальную плоскость из силового поля диаметром 3 фута и толщиной 1 дюйм, парящую в 3 футах над землёй в незанятом пространстве на ваш выбор, видимом в пределах дистанции. Диск остается неподвижным, пока вы находитесь в пределах 20 футов от него. Если вы выходите за пределы 20 футов от диска, он следует за вами, оставаясь в пределах 20 футов от вас. Диск может перемещаться по неровной местности, подниматься и спускаться по лестницам и склонам, но он не может пересекать перепад высот в 10 и более футов.",
    classes: ["Волшебник"]
  },
  {
    id: "level1-41",
    name: "Туманное облако",
    level: 1,
    school: "Вызов",
    castingTime: "1 действие",
    range: "120 футов",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 часа",
    description: "Вы создаёте сферу тумана радиусом 20 футов с центром на точке в пределах дистанции. Сфера распространяется за углы, и её область считается сильно заслонённой. Она существует, пока активно заклинание, или пока ветер (не менее 10 миль в час) не рассеет её.",
    classes: ["Волшебник", "Чародей", "Друид", "Бард", "Следопыт"]
  },
  {
    id: "level1-42",
    name: "Убежище",
    level: 1,
    school: "Ограждение",
    castingTime: "1 бонусное действие",
    range: "30 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "1 минута",
    description: "Вы оберегаете одно существо в пределах дистанции. Пока заклинание активно, оно становится незаметным для определённого вида существ на ваш выбор: аберрации, феи, исчадия, небожители, нежить или элементали. Выбранные существа не могут напрямую атаковать защищённое существо, или выбирать его целью заклинаний и других магических эффектов.",
    classes: ["Жрец", "Волшебник"]
  },
  {
    id: "level1-43",
    name: "Удар Зефира",
    level: 1,
    school: "Преобразование",
    castingTime: "1 бонусное действие",
    range: "На себя",
    components: "В",
    verbal: true,
    somatic: false,
    material: false,
    concentration: true,
    duration: "Концентрация, вплоть до 1 минуты",
    description: "Вы окружаете себя магическим ветром. Пока заклинание активно, ваша скорость бега увеличивается на 30 футов. Один раз до окончания заклинания вы можете бонусным действием совершить дальнобойную атаку заклинанием против одного существа. При попадании вы наносите урон силовым полем 1к8 + ваш модификатор базовой характеристики и толкаете цель на 10 футов от себя.",
    classes: ["Волшебник"]
  },
  {
    id: "level1-44",
    name: "Усыпление",
    level: 1,
    school: "Очарование",
    castingTime: "1 действие",
    range: "90 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "1 минута",
    description: "Это заклинание погружает существ в магический сон. Бросьте 5к8; получившаяся сумма показывает, сколько хитов существ могут быть подвержены этому заклинанию. Существа в пределах 20 футов от точки, выбранной вами в пределах дистанции, становятся целями в порядке возрастания их текущего количества хитов (игнорируя тех, кто без сознания).",
    classes: ["Бард", "Чародей", "Волшебник"],
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку заклинания 2 уровня или выше, бросайте дополнительные 2к8 за каждый уровень ячейки выше 1."
  },
  {
    id: "level1-45",
    name: "Цветной шарик",
    level: 1,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "90 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    duration: "Мгновенная",
    description: "Вы кидаете шарик энергии в существо в пределах дистанции. Выбираете кислоту, холод, огонь, молнию, яд или звук для вида энергии, и затем совершаете дальнобойную атаку заклинанием. При попадании цель получает урон 3к8 выбранного вида энергии.",
    classes: ["Чародей", "Волшебник"],
    higherLevels: "Когда вы накладываете это заклинание, используя ячейку заклинания 2 уровня или выше, урон увеличивается на 1к8 за каждый уровень ячейки выше 1."
  },
  {
    id: "level1-46",
    name: "Церемония",
    level: 1,
    school: "Воплощение",
    castingTime: "1 час",
    range: "Касание",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "Мгновенная",
    description: "Вы совершаете специальную религиозную церемонию, которая наполнена силой магии. При накладывании заклинания вы выбираете одно из следующих воздействий: Искупление, Взросление, Отдых, Преданность, Знакомство, Благословение воды для создания святой воды.",
    classes: ["Жрец", "Паладин"]
  },
  {
    id: "level1-47",
    name: "Чудо-ягоды",
    level: 1,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "Касание",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    ritual: true,
    duration: "Мгновенная",
    description: "До десяти ягод становятся наполненными магией на время действия заклинания. Существо может действием съесть одну ягоду. При этом существо восстанавливает 1 хит, и ягода обеспечивает его питанием на целый день.",
    classes: ["Друид", "Следопыт"]
  },
  {
    id: "level1-48",
    name: "Щит",
    level: 1,
    school: "Ограждение",
    castingTime: "1 реакция",
    range: "На себя",
    components: "ВС",
    verbal: true,
    somatic: true,
    material: false,
    duration: "1 раунд",
    description: "Невидимый барьер силового поля появляется и защищает вас. До начала вашего следующего хода вы получаете бонус +5 к КД, в том числе и против вызвавшей заклинание атаки, и вы не получаете урон от волшебной стрелы.",
    classes: ["Волшебник", "Чародей"]
  },
  {
    id: "level1-49",
    name: "Щит веры",
    level: 1,
    school: "Ограждение",
    castingTime: "1 бонусное действие",
    range: "60 футов",
    components: "ВСМ",
    verbal: true,
    somatic: true,
    material: true,
    concentration: true,
    duration: "Концентрация, вплоть до 10 минут",
    description: "Мерцающее поле появляется вокруг существа на ваш выбор в пределах дистанции, и даёт ему бонус +2 к КД на время действия заклинания.",
    classes: ["Жрец", "Паладин"]
  }
];
