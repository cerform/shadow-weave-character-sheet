
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, BookOpen, Scroll, Award, User, Shield, Swords } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { NavigationButtons } from '@/components/ui/NavigationButtons';

const HandbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  console.log("HandbookPage rendering");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme} p-4`}>
      <div className="container mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/')} size="icon">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="size-6" />
              Руководство игрока D&D 5e
            </h1>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Боковая панель с поиском и навигацией */}
          <div className="w-full md:w-64 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск в руководстве..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            
            <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle>Разделы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {}}>
                  <User className="size-4" />
                  <span>Расы</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {}}>
                  <Swords className="size-4" />
                  <span>Классы</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {}}>
                  <Award className="size-4" />
                  <span>Предыстории</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {}}>
                  <Shield className="size-4" />
                  <span>Снаряжение</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {}}>
                  <Scroll className="size-4" />
                  <span>Заклинания</span>
                </Button>
              </CardContent>
            </Card>
            
            <NavigationButtons className="flex-col" />
          </div>
          
          {/* Основной контент */}
          <div className="flex-1">
            <Tabs defaultValue="intro">
              <TabsList className="mb-4">
                <TabsTrigger value="intro">Введение</TabsTrigger>
                <TabsTrigger value="races">Расы</TabsTrigger>
                <TabsTrigger value="classes">Классы</TabsTrigger>
                <TabsTrigger value="rules">Правила</TabsTrigger>
              </TabsList>
              
              <TabsContent value="intro">
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Добро пожаловать в мир D&D!</CardTitle>
                    <CardDescription>
                      Руководство игрока - основная книга правил для игроков в Dungeons & Dragons
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 prose dark:prose-invert max-w-none">
                    <p>
                      <strong>Dungeons & Dragons</strong> — это игра, рассказывающая истории, происходящие в мирах мечей и магии. В ней есть элементы игры-притворства, настольной игры, а также магического всемирного досуга. Эта игра имеет корни в рассказах о великих волшебниках дуэлянтах и храбрых сердцем героях. 
                    </p>
                    <p>
                      В отличие от игр с определенным сюжетом, D&D позволяет вам персонализировать персонажей как вы захотите, имея неисчислимое количество игрового опыта и приключений. Когда вы играете D&D, вы рассказываете историю вместе, направляя персонажей сквозь фантастическое приключение. 
                    </p>
                    <p>
                      Один игрок берет на себя роль Мастера Подземелий (МП), главного рассказчика и судьи игры. МП создаёт приключения для персонажей, которые преодолевают опасности и решают, куда отправиться в путешествие. 
                    </p>
                    <p>
                      Мастер может описать вход в замок Равенлофт, а игроки решить, как их искатели приключений будут взаимодействовать с ситуацией. Они ворвутся через дверь? Попытаются сначала поговорить со стражей? Или они воспользуются магией?
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="races">
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Расы</CardTitle>
                    <CardDescription>
                      Выберите свою расу и узнайте о её особенностях
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose dark:prose-invert max-w-none">
                    <p>
                      Посетив шумные ратуши в поселениях людей, ты встретишь крепких дварфов и стройных эльфов, а также многих других диковинных рас. В одних районах города могут проживать представители наиболее многочисленных рас, а в других — представители редких и необычных рас.
                    </p>
                    <p>
                      Раса персонажа не только влияет на его внешность, но и даёт ему преимущество в виде расовой особенности, крепкого телосложения, скорости, зрения и т. д. Расовая принадлежность влияет на склонность персонажа к определённым классам и определяет доступность некоторых вариантов и способностей. К сожалению, из-за некоторых расовых особенностей персонаж также может встречаться с предрассудками во время своих путешествий.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="classes">
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Классы</CardTitle>
                    <CardDescription>
                      Познакомьтесь с доступными классами персонажей
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose dark:prose-invert max-w-none">
                    <p>
                      В мире Dungeons & Dragons каждый искатель приключений — представитель определённого класса. Класс отражает призвание персонажа, набор особых талантов и тактик, которыми от располагает. Классы рассказывают не только о занятиях и способностях персонажа, но и о его месте в мире D&D.
                    </p>
                    <p>
                      Искатели приключений тренируются многие годы, оттачивая свои навыки, и в их тренировках нередко пригождаются техники и традиции, формирующиеся на протяжении многих поколений и даже веков.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules">
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Правила</CardTitle>
                    <CardDescription>
                      Основные игровые механики и правила
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose dark:prose-invert max-w-none">
                    <p>
                      В основе игры Dungeons & Dragons лежит взаимодействие между Мастером Подземелий, описывающим окружающую среду и сюжетную линию, и игроками, описывающими действия, которые хотят совершить их персонажи. Во многих случаях исход попытки действия известен. Если искатель приключений хочет пройти через стандартную дверь, которая не заперта, он просто проходит через неё.
                    </p>
                    <p>
                      В других случаях исход действия не определен, например, когда искатель приключений пытается пробежать по скользкому льду, убедить стражника отпустить пленника, или не поддаться магическим эффектам. В таких ситуациях игра полагается на броски d20, двадцатигранного игрального кубика, который определяет исход действия.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandbookPage;
