import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { races } from "@/data/races";
import { classes } from "@/data/classes";

const PlayerHandbookPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className={`min-h-screen bg-background text-foreground theme-${theme} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Button>
          
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по руководству..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <BookOpen className="h-8 w-8" />
              Руководство игрока D&D 5e
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Полное руководство по созданию персонажей, правилам игры, заклинаниям, снаряжению и всему необходимому для вашего приключения.
            </p>
          </div>

          <NavigationMenu className="justify-center">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Персонаж</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="#character-creation"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Создание персонажа
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Пошаговое руководство по созданию персонажа D&D 5e.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#races"
                        >
                          <div className="text-sm font-medium leading-none">Расы</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Эльфы, дварфы, люди и другие расы мира D&D.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#classes"
                        >
                          <div className="text-sm font-medium leading-none">Классы</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Воины, маги, жрецы и другие классы персонажей.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#backgrounds"
                        >
                          <div className="text-sm font-medium leading-none">Предыстории</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Происхождение и история вашего персонажа.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Правила</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#basic-rules"
                        >
                          <div className="text-sm font-medium leading-none">Базовые правила</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Основные концепции и механики игры D&D 5e.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#combat"
                        >
                          <div className="text-sm font-medium leading-none">Бой</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Правила боя, действия, реакции и бонусные действия.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#ability-checks"
                        >
                          <div className="text-sm font-medium leading-none">Проверки характеристик</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Использование характеристик и навыков персонажа.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Снаряжение</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#weapons"
                        >
                          <div className="text-sm font-medium leading-none">Оружие</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Типы оружия и их характеристики.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#armor"
                        >
                          <div className="text-sm font-medium leading-none">Доспехи</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Типы доспехов и их характеристики.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#items"
                        >
                          <div className="text-sm font-medium leading-none">Предметы</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Магические и обычные предметы, инструменты и снаряжение.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Магия</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#spellcasting"
                        >
                          <div className="text-sm font-medium leading-none">Колдовство</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Основные правила использования магии.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="#spells"
                        >
                          <div className="text-sm font-medium leading-none">Заклинания</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Список и описание всех заклинаний.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Tabs defaultValue="races" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="races">Расы</TabsTrigger>
              <TabsTrigger value="classes">Классы</TabsTrigger>
              <TabsTrigger value="rules">Правила</TabsTrigger>
              <TabsTrigger value="spells">Заклинания</TabsTrigger>
            </TabsList>
            
            <TabsContent value="races" className="mt-6">
              <h2 className="text-3xl font-bold mb-6" id="races">Расы</h2>
              <p className="mb-6 text-lg">
                Расы определяют важные характеристики персонажа, включая базовые способности, язык, продолжительность жизни и некоторые особые навыки.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {races.map((race) => (
                  <Card key={race.name} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{race.name}</CardTitle>
                      <CardDescription>{race.abilityBonuses}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{race.description}</p>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Срок жизни:</span> {race.lifespan}</p>
                        <p><span className="font-medium">Размер:</span> {race.size}</p>
                        <p><span className="font-medium">Скорость:</span> {race.speed}</p>
                        <p><span className="font-medium">Языки:</span> {race.languages}</p>
                      </div>
                      {race.subRaces.length > 0 && (
                        <div className="mt-4">
                          <p className="font-medium mb-1">Подрасы:</p>
                          <ul className="list-disc pl-5">
                            {race.subRaces.map(subrace => (
                              <li key={subrace}>{subrace}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="classes" className="mt-6">
              <h2 className="text-3xl font-bold mb-6" id="classes">Классы</h2>
              <p className="mb-6 text-lg">
                Класс персонажа определяет его особые способности, стиль игры, роль в группе и то, как он развивается с получением уровней.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <Card key={classItem.name} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{classItem.name}</CardTitle>
                      <CardDescription>{classItem.description.split('.')[0]}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium">Кость хитов:</p>
                        <p>{classItem.hitDie}</p>
                      </div>
                      <div>
                        <p className="font-medium">Источник заклинаний:</p>
                        <p>{classItem.primaryAbility || "Нет"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Владения доспехами:</p>
                        <p>{classItem.proficiencies || "Нет"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Владения оружием:</p>
                        <p>{classItem.proficiencies || "Нет"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Спасброски:</p>
                        <p>{classItem.savingThrows}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="mt-6">
              <h2 className="text-3xl font-bold mb-6" id="rules">Основные правила</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold mb-4" id="basic-rules">Базовые правила</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="mb-4">
                        Dungeons & Dragons (D&D) — это ролевая игра, в которой игроки создают персонажей и отправляются в приключения под руководством Мастера Подземелий (DM).
                      </p>
                      
                      <h4 className="text-xl font-semibold mb-2">Основа игры</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-4">
                        <li>Мастер описывает окружение.</li>
                        <li>Игроки решают, что хотят делать их персонажи.</li>
                        <li>Мастер определяет результаты действий персонажей.</li>
                      </ol>
                      
                      <h4 className="text-xl font-semibold mb-2">Броски костей</h4>
                      <p className="mb-2">
                        D&D использует многогранные кости для определения результатов действий:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>d4 (четырехгранная)</li>
                        <li>d6 (шестигранная)</li>
                        <li>d8 (восьмигранная)</li>
                        <li>d10 (десятигранная)</li>
                        <li>d12 (двенадцатигранная)</li>
                        <li>d20 (двадцатигранная) — основная кость для большинства проверок</li>
                        <li>d100 (процентная) — обычно комбинация двух d10</li>
                      </ul>
                      
                      <h4 className="text-xl font-semibold mb-2">Модификаторы</h4>
                      <p>
                        Модификаторы характеристик применяются к броскам костей и рассчитываются по формуле: (Значение характеристики - 10) / 2, округленное вниз.
                      </p>
                    </CardContent>
                  </Card>
                </section>
                
                <section>
                  <h3 className="text-2xl font-bold mb-4" id="combat">Бой</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="mb-4">
                        Бой в D&D разделён на раунды, каждый из которых представляет собой 6 секунд игрового времени. В каждом раунде все участники действуют по очереди, определяемой инициативой.
                      </p>
                      
                      <h4 className="text-xl font-semibold mb-2">Порядок боя</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-4">
                        <li>Определение внезапности — проверка Ловкости (Скрытность) против пассивного Восприятия.</li>
                        <li>Бросок инициативы — d20 + модификатор Ловкости.</li>
                        <li>Действия в бою — каждый участник совершает свой ход в порядке инициативы.</li>
                      </ol>
                      
                      <h4 className="text-xl font-semibold mb-2">Доступные действия в бою</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li><span className="font-medium">Действие:</span> Атака, колдовство, уклонение, рывок, помощь и др.</li>
                        <li><span className="font-medium">Бонусное действие:</span> Определённые способности, заклинания.</li>
                        <li><span className="font-medium">Передвижение:</span> До значения скорости персонажа.</li>
                        <li><span className="font-medium">Реакция:</span> Ответ на определённое условие, например, атака по возможности.</li>
                      </ul>
                      
                      <h4 className="text-xl font-semibold mb-2">Атаки и урон</h4>
                      <p>
                        Атака требует броска d20 + модификатор атаки против класса брони (AC) цели. При попадании наносится урон в зависимости от используемого оружия или заклинания.
                      </p>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="spells" className="mt-6">
              <h2 className="text-3xl font-bold mb-6" id="spells">Заклинания</h2>
              <p className="mb-6 text-lg">
                Магия — одна из ключевых особенностей D&D. Различные классы используют заклинания по-разному, от волшебников, записывающих их в книгу, до жрецов, получающих божественную силу.
              </p>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle id="spellcasting">Основы колдовства</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Магия в D&D структурирована через уровни заклинаний (от 0 до 9), где более высокие уровни представляют более мощные эффекты.
                  </p>
                  
                  <h4 className="text-xl font-semibold mb-2">Компоненты заклинаний</h4>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li><span className="font-medium">Вербальный (V):</span> Произнесение специальных слов.</li>
                    <li><span className="font-medium">Соматический (S):</span> Особые жесты руками.</li>
                    <li><span className="font-medium">Материальный (M):</span> Специальные материалы или фокусировка.</li>
                  </ul>
                  
                  <h4 className="text-xl font-semibold mb-2">Подготовка и использование заклинаний</h4>
                  <p className="mb-2">
                    Разные классы готовят и используют заклинания по-разному:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-medium">Волшебники:</span> Записывают заклинания в книгу и готовят их после отдыха.</li>
                    <li><span className="font-medium">Жрецы и Друиды:</span> Имеют доступ ко всем заклинаниям своего класса, выбирая, какие подготовить после отдыха.</li>
                    <li><span className="font-medium">Колдуны и Барды:</span> Знают ограниченное количество заклинаний, которые всегда готовы к использованию.</li>
                  </ul>
                </CardContent>
              </Card>
              
              <p className="text-lg font-semibold mb-4">
                Скоро здесь появится полный список заклинаний D&D 5e с описаниями, компонентами и требованиями к классам.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlayerHandbookPage;
