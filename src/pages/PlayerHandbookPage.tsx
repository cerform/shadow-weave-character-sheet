import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavigationButtons from "@/components/ui/NavigationButtons";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Badge } from "@/components/ui/badge";
import { races } from "@/data/races";

const PlayerHandbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];

  // Используем стили темы для улучшения контрастности
  const cardBgClass = "bg-card border border-primary/10 hover:border-primary/30 transition-all duration-300";
  
  // Стили для текста с улучшенной контрастностью
  const textStyle = { 
    color: currentTheme.textColor,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)'
  };
  
  const mutedTextStyle = {
    color: currentTheme.mutedTextColor,
    textShadow: '0px 1px 1px rgba(0, 0, 0, 0.4)'
  };

  return (
    <div className="container relative pb-10 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={textStyle}>
          <BookOpen className="size-6" />
          Руководство игрока D&D 5e
        </h1>
        <p style={mutedTextStyle} className="text-muted-foreground">
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
          <TabsTrigger 
            value="races" 
            style={{color: currentTheme.textColor}}
            className="data-[state=inactive]:text-foreground/70">
            Расы
          </TabsTrigger>
          <TabsTrigger 
            value="classes" 
            style={{color: currentTheme.textColor}}
            className="data-[state=inactive]:text-foreground/70">
            Классы
          </TabsTrigger>
          <TabsTrigger 
            value="equipment" 
            style={{color: currentTheme.textColor}}
            className="data-[state=inactive]:text-foreground/70">
            Снаряжение
          </TabsTrigger>
          <TabsTrigger 
            value="rules" 
            style={{color: currentTheme.textColor}}
            className="data-[state=inactive]:text-foreground/70">
            Правила
          </TabsTrigger>
        </TabsList>

        <TabsContent value="races" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={textStyle}>Расы D&D 5e</CardTitle>
              <CardDescription style={mutedTextStyle}>
                Выберите основную расу вашего персонажа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races.map((race) => (
                  <Card key={race.name} className={cardBgClass}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg" style={textStyle}>{race.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {race.abilityBonuses}
                        </Badge>
                        {race.subRaces && race.subRaces.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {race.subRaces.length} подрас{race.subRaces.length === 1 ? 'а' : 'ы'}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm mb-3" style={mutedTextStyle}>{race.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2 text-xs">
                          <span className="font-medium" style={textStyle}>Размер:</span>
                          <span style={mutedTextStyle}>{race.size}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="font-medium" style={textStyle}>Скорость:</span>
                          <span style={mutedTextStyle}>{race.speed}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="font-medium" style={textStyle}>Языки:</span>
                          <span style={mutedTextStyle}>{race.languages}</span>
                        </div>
                      </div>
                    
                      {race.subRaces && race.subRaces.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-medium" style={textStyle}>Подрасы:</h4>
                          <ul className="list-disc pl-5 text-xs" style={mutedTextStyle}>
                            {race.subRaces.map((subrace, i) => (
                              <li key={i}>{subrace}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <h4 className="text-xs font-medium mt-3" style={textStyle}>Расовые черты:</h4>
                      <ul className="list-disc pl-5 text-xs" style={mutedTextStyle}>
                        {race.traits.map((trait, i) => (
                          <li key={i} title={trait.description}>{trait.name}</li>
                        ))}
                      </ul>
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
              <CardTitle style={textStyle}>Классы D&D 5e</CardTitle>
              <CardDescription style={mutedTextStyle}>
                Основные классы персонажей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classItem) => (
                  <Card key={classItem.name} className={cardBgClass}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg" style={textStyle}>{classItem.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm mb-2" style={mutedTextStyle}>{classItem.description}</p>
                      <h4 className="text-sm font-medium" style={textStyle}>Основные умения:</h4>
                      <ul className="list-disc pl-5 text-sm mb-2" style={textStyle}>
                        {classItem.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                      <h4 className="text-sm font-medium" style={textStyle}>Хиты:</h4>
                      <p className="text-sm" style={textStyle}>{classItem.hitDice}</p>
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
              <CardTitle style={textStyle}>Снаряжение</CardTitle>
              <CardDescription style={mutedTextStyle}>Оружие, доспехи и снаряжение</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Оружие</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
                      В D&D доступно разнообразное оружие, каждое со своими характеристиками и особенностями. 
                      Оружие делится на простое и воинское, а также на рукопашное и дальнобойное.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Доспехи</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
                      Доспехи предоставляют защиту вашему персонажу. Они подразделяются на лёгкие, средние и тяжёлые.
                      Вид доспеха, который может носить ваш персонаж, зависит от его класса и характеристик.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Приключенческое снаряжение</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
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
              <CardTitle style={textStyle}>Основные правила</CardTitle>
              <CardDescription style={mutedTextStyle}>Базовые механики игры</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Проверки характеристик</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
                      Проверки характеристик определяют успех или неудачу в действиях персонажа.
                      Игрок бросает d20, добавляет соответствующий модификатор характеристики и сравнивает результат со сложностью (DC).
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Боевая система</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
                      Бой в D&D проходит в пошаговом режиме. Каждый участник действует в своём ходе согласно инициативе.
                      На своём ходе персонаж может совершить действие, бонусное действие, перемещение и реакцию.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Отдых</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
                      В игре существует два типа отдыха: короткий (1 час) и долгий (8 часов).
                      Во время отдыха персонажи восстанавливают здоровье и ресурсы.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={cardBgClass}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg" style={textStyle}>Опыт и уровни</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm" style={textStyle}>
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
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2"
          style={{color: currentTheme.textColor, borderColor: currentTheme.accent}}
        >
          <ChevronLeft className="h-4 w-4" />
          На главную
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/spellbook')} 
          className="flex items-center gap-2"
          style={{color: currentTheme.textColor, borderColor: currentTheme.accent}}
        >
          Книга заклинаний
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Данные для демонстрации
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
  },
  {
    name: "Бард",
    description: "Мастер вдохновения и магии, черпающий силу из музыки и слов.",
    features: ["Бардическое вдохновение", "Мастер на все руки", "Знание заклинаний"],
    hitDice: "1d8 за уровень барда"
  },
  {
    name: "Друид",
    description: "Хранитель природы с магическими способностями и возможностью превращаться в зверей.",
    features: ["Дикий облик", "Круг друидов", "Защитник природы"],
    hitDice: "1d8 за уровень друида"
  },
  {
    name: "Следопыт",
    description: "Знаток дикой местности, охотник и следопыт.",
    features: ["Избранный враг", "Природоведение", "Охотничий стиль"],
    hitDice: "1d10 за уровень следопыта"
  },
  {
    name: "Колдун",
    description: "Маг, получивший силу через пакт с могущественным существом.",
    features: ["Потусторонний покровитель", "Пакт", "Мистические воззвания"],
    hitDice: "1d8 за уровень колдуна"
  },
  {
    name: "Чародей",
    description: "Маг с врождённой магической силой в крови.",
    features: ["Происхождение колдовства", "Волшебные очки", "Метамагия"],
    hitDice: "1d6 за уровень чародея"
  },
  {
    name: "Паладин",
    description: "Боец, давший священную клятву и обладающий божественной силой.",
    features: ["Божественное чувство", "Божественная кара", "Священная клятва"],
    hitDice: "1d10 за уровень паладина"
  },
  {
    name: "Монах",
    description: "Мастер боевых искусств, использующий энергию тела и духа.",
    features: ["Боевые искусства", "Ци", "Защита без доспехов"],
    hitDice: "1d8 за уровень монаха"
  }
];

export default PlayerHandbookPage;
