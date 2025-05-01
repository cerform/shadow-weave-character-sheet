
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";

const HandbookPage: React.FC = () => {
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

      <Tabs defaultValue="races" className="space-y-4">
        <TabsList className="grid grid-cols-4 h-auto">
          <TabsTrigger value="races">Расы</TabsTrigger>
          <TabsTrigger value="classes">Классы</TabsTrigger>
          <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
          <TabsTrigger value="rules">Правила</TabsTrigger>
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
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 pr-6">
                  {races.map((race) => (
                    <div key={race.name} className="space-y-2">
                      <h3 className="text-xl font-semibold">{race.name}</h3>
                      <p className="text-muted-foreground">{race.description}</p>
                      <h4 className="text-md font-medium mt-2">Особенности:</h4>
                      <ul className="list-disc pl-5">
                        {race.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                      <h4 className="text-md font-medium mt-2">Прирост характеристик:</h4>
                      <p>{race.abilityScores}</p>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 pr-6">
                  {classes.map((classItem) => (
                    <div key={classItem.name} className="space-y-2">
                      <h3 className="text-xl font-semibold">{classItem.name}</h3>
                      <p className="text-muted-foreground">{classItem.description}</p>
                      <h4 className="text-md font-medium mt-2">Основные умения:</h4>
                      <ul className="list-disc pl-5">
                        {classItem.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                      <h4 className="text-md font-medium mt-2">Хиты:</h4>
                      <p>{classItem.hitDice}</p>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 pr-6">
                  <h3 className="text-xl font-semibold">Оружие</h3>
                  <p>
                    В D&D доступно разнообразное оружие, каждое со своими характеристиками и особенностями. 
                    Оружие делится на простое и воинское, а также на рукопашное и дальнобойное.
                  </p>
                  
                  <h3 className="text-xl font-semibold">Доспехи</h3>
                  <p>
                    Доспехи предоставляют защиту вашему персонажу. Они подразделяются на лёгкие, средние и тяжёлые.
                    Вид доспеха, который может носить ваш персонаж, зависит от его класса и характеристик.
                  </p>
                  
                  <h3 className="text-xl font-semibold">Приключенческое снаряжение</h3>
                  <p>
                    Включает в себя всё необходимое для приключений: верёвки, фонари, инструменты для взлома, 
                    наборы для лечения, рационы, палатки и многое другое.
                  </p>
                </div>
              </ScrollArea>
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
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 pr-6">
                  <h3 className="text-xl font-semibold">Проверки характеристик</h3>
                  <p>
                    Проверки характеристик определяют успех или неудачу в действиях персонажа.
                    Игрок бросает d20, добавляет соответствующий модификатор характеристики и сравнивает результат со сложностью (DC).
                  </p>
                  
                  <h3 className="text-xl font-semibold">Боевая система</h3>
                  <p>
                    Бой в D&D проходит в пошаговом режиме. Каждый участник действует в своём ходе согласно инициативе.
                    На своём ходу персонаж может совершить действие, бонусное действие, перемещение и реакцию.
                  </p>
                  
                  <h3 className="text-xl font-semibold">Отдых</h3>
                  <p>
                    В игре существует два типа отдыха: короткий (1 час) и долгий (8 часов).
                    Во время отдыха персонажи восстанавливают здоровье и ресурсы.
                  </p>
                  
                  <h3 className="text-xl font-semibold">Опыт и уровни</h3>
                  <p>
                    Персонажи получают опыт за победу над врагами и выполнение заданий.
                    Накопив достаточно опыта, персонаж повышает свой уровень, что даёт новые способности и увеличивает характеристики.
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Данные для демонстрации
const races = [
  {
    name: "Человек",
    description: "Люди — самая распространённая раса в мирах D&D, адаптируемые и честолюбивые.",
    features: ["Универсальный", "Разнообразный", "Амбициозный"],
    abilityScores: "+1 ко всем характеристикам или +1 к двум характеристикам и один дополнительный навык"
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
