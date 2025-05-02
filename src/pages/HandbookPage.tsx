import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavigationButtons from "@/components/ui/NavigationButtons";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from '@/hooks/use-theme';

const HandbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const cardBgClass = `bg-card border border-${theme}-500/10 hover:border-${theme}-500/30 transition-all duration-300`;

  return (
    <div className="container relative pb-10 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="size-6" />
          Руководство игрока D&D 5e
        </h1>
        <p className="text-muted-foreground">
          Основная информация для игроков Dungeons & Dragons 5-й редакции
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <NavigationButtons />
        <div>
          <ThemeSelector />
        </div>
      </div>

      <Tabs defaultValue="races" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="races" className="text-foreground data-[state=inactive]:text-foreground/70">Расы</TabsTrigger>
          <TabsTrigger value="classes" className="text-foreground data-[state=inactive]:text-foreground/70">Классы</TabsTrigger>
          <TabsTrigger value="equipment" className="text-foreground data-[state=inactive]:text-foreground/70">Снаряжение</TabsTrigger>
          <TabsTrigger value="rules" className="text-foreground data-[state=inactive]:text-foreground/70">Правила</TabsTrigger>
        </TabsList>

        <TabsContent value="races" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Расы D&D 5e</CardTitle>
              <CardDescription>
                Выберите основную расу вашего персонажа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races.map((race) => (
                  <Card key={race.name} className={cardBgClass}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{race.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm mb-2">{race.description}</p>
                      <h4 className="text-sm font-medium">Особенности:</h4>
                      <ul className="list-disc pl-5 text-sm mb-2">
                        {race.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                      <h4 className="text-sm font-medium">Прирост характеристик:</h4>
                      <p className="text-sm">{race.abilityScores}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Классы D&D 5e</CardTitle>
              <CardDescription>
                Основные классы персонажей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classItem) => (
                  <Card key={classItem.name} className={cardBgClass}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm mb-2">{classItem.description}</p>
                      <h4 className="text-sm font-medium">Основные умения:</h4>
                      <ul className="list-disc pl-5 text-sm mb-2">
                        {classItem.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                      <h4 className="text-sm font-medium">Хиты:</h4>
                      <p className="text-sm">{classItem.hitDice}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Снаряжение</CardTitle>
              <CardDescription>Оружие, доспехи и снаряжение</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Оружие</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      В D&D доступно разнообразное оружие, каждое со своими характеристиками и особенностями. 
                      Оружие делится на простое и воинское, а также на рукопашное и дальнобойное.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Доспехи</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      Доспехи предоставляют защиту вашему персонажу. Они подразделяются на лёгкие, средние и тяжёлые.
                      Вид доспеха, который может носить ваш персонаж, зависит от его класса и характеристик.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Приключенческое снаряжение</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      Включает в себя всё необходимое для приключений: верёвки, фонари, инструменты для взлома, 
                      наборы для лечения, рационы, палатки и многое другое.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Основные правила</CardTitle>
              <CardDescription>Базовые механики игры</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Проверки характеристик</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      Проверки характеристик определяют успех или неудачу в действиях персонажа.
                      Игрок бросает d20, добавляет соответствующий модификатор характеристики и сравнивает результат со сложностью (DC).
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Боевая система</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      Бой в D&D проходит в пошаговом режиме. Каждый участник действует в своём ходе согласно инициативе.
                      На своём ходе персонаж может совершить действие, бонусное действие, перемещение и реакцию.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Отдых</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      В игре существует два типа отдыха: короткий (1 час) и долгий (8 часов).
                      Во время отдыха персонажи восстанавливают здоровье и ресурсы.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Опыт и уровни</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      Персонажи получают опыт за победу над врагами и выполнение заданий.
                      Накопив достаточно опыта, персонаж повышает свой уровень, что даёт новые способности и увеличивает характеристики.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Улучшенная навигация внизу страницы */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          На главную
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/spellbook')} 
          className="flex items-center gap-2 text-foreground"
        >
          Книга заклинаний
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Данные для демонстрации
const races = [
  {
    name: "Человек",
    description: "Люди — самая распространённая раса в мирах D&D, адаптируемые и честолюбивые.",
    features: ["Универсальный", "Разнообразный", "Амбициозный"],
    abilityScores: "+1 к�� всем характеристикам или +1 к двум характеристикам и один дополнительный навык"
  },
  {
    name: "Эльф",
    description: "Эльфы — магический народ неземной грации, живущий в мире, но не являющийся его частью.",
    features: ["Тёмное зрение", "Обострённые чувства", "Наследие фей", "Транс"],
    abilityScores: "+2 к Ловкости"
  },
  {
    name: "Дварф",
    description: "Отважные и выносливые воины, дварфы известны своей мастерской работой с камнем и металлом.",
    features: ["Тёмное зрение", "Дварфская выносливость", "Дварфский боевой тренинг", "Знание камня"],
    abilityScores: "+2 к Телосложению"
  },
  {
    name: "Полурослик",
    description: "Маленькие исследователи, известные своей смелостью и любопытством.",
    features: ["Везучий", "Храбрость", "Проворство полурослика"],
    abilityScores: "+2 к Ловкости"
  },
  {
    name: "Дракорождённый",
    description: "Гуманоиды с драконьим наследием, способные использовать дыхание дракона.",
    features: ["Драконье происхождение", "Дыхание дракона", "Сопротивление к урону"],
    abilityScores: "+2 к Силе, +1 к Харизме"
  }
];

const classes = [
  {
    name: "Воин",
    description: "Мастер оружия и доспехов, опытный в бою и выносливый.",
    features: ["Боевой стиль", "Второе дыхание", "Всплеск действий"],
    hitDice: "1d10 за уровень воина"
  },
  {
    name: "Волшебник",
    description: "Учёный магии, способный управлять могущественными заклинаниями.",
    features: ["Магическое восстановление", "Магическая традиция", "Школьные умения"],
    hitDice: "1d6 за уровень волшебника"
  },
  {
    name: "Жрец",
    description: "Проводник божественной силы, способный лечить и защищать.",
    features: ["Божественный домен", "Божественный канал", "Ритуалы"],
    hitDice: "1d8 за уровень жреца"
  },
  {
    name: "Плут",
    description: "Мастер скрытности и коварных атак.",
    features: ["Скрытая атака", "Воровские способности", "Увёртливость"],
    hitDice: "1d8 за уровень плута"
  },
  {
    name: "Варвар",
    description: "Свирепый воин, черпающий силу в ярости.",
    features: ["Ярость", "Безрассудное нападение", "Защита без доспехов"],
    hitDice: "1d12 за уровень варвара"
  }
];

export default HandbookPage;
