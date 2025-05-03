
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, BookOpen, ExternalLink, User, Sword, Wand, Mountain } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from '@/hooks/use-mobile';
import { themes } from '@/lib/themes';

export const PlayerHandbookTab = () => {
  const [activeSection, setActiveSection] = useState("basics");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Улучшенные стили для лучшей видимости текста
  const textStyle = {
    color: '#FFFFFF',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  };
  
  const cardStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderColor: currentTheme.accent
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold flex items-center" style={textStyle}>
          <BookOpen className="mr-2 h-5 w-5" />
          {isMobile ? "D&D 5e" : "Руководство игрока D&D 5e"}
        </h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/handbook')} 
          size="sm"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: currentTheme.accent,
            color: '#FFFFFF'
          }}
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          {isMobile ? 'Открыть' : 'Открыть полную версию'}
        </Button>
      </div>

      <Tabs defaultValue={activeSection} onValueChange={setActiveSection}>
        <TabsList className={`w-full grid ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4'}`}>
          <TabsTrigger value="basics" className="flex items-center justify-center gap-1">
            <Book className="size-3" />
            {!isMobile && "Основы"}
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center justify-center gap-1">
            <Sword className="size-3" />
            {!isMobile && "Классы"}
          </TabsTrigger>
          <TabsTrigger value="races" className="flex items-center justify-center gap-1">
            <Mountain className="size-3" />
            {!isMobile && "Расы"}
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center justify-center gap-1">
            <BookOpen className="size-3" />
            {!isMobile && "Правила"}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-380px)]' : 'h-[calc(100vh-360px)]'} mt-4`}>
          <TabsContent value="basics" className="space-y-4">
            <Card style={cardStyle}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2" style={textStyle}>Основы D&D 5e</h3>
                <p className="mb-2 text-sm" style={textStyle}>
                  Dungeons & Dragons (D&D) - это ролевая настольная игра, в которой один игрок (Мастер Подземелий) руководит историей, 
                  а остальные управляют своими персонажами в этом мире.
                </p>
                <p className="mb-2 text-sm" style={textStyle}>
                  Игровой процесс состоит из описания ситуаций Мастером Подземелий, решений игроков о действиях их персонажей 
                  и бросков костей для определения результата этих действий.
                </p>
                <h4 className="font-medium mt-4 mb-2" style={textStyle}>Проверки способностей</h4>
                <p className="text-sm" style={textStyle}>
                  Когда ваш персонаж пытается выполнить задачу, результат которой не очевиден, 
                  Мастер Подземелий может попросить вас сделать проверку способностей. Для этого бросается d20 
                  и к результату добавляется соответствующий модификатор способности.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card style={cardStyle}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2" style={textStyle}>Классы персонажей</h3>
                <p className="mb-2 text-sm" style={textStyle}>
                  Класс персонажа определяет его основные способности, навыки и стиль игры. Вот краткий обзор классов:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm" style={textStyle}>
                  <li><strong>Варвар:</strong> Свирепый воин, использующий ярость для усиления в бою</li>
                  <li><strong>Бард:</strong> Универсальный заклинатель, вдохновляющий союзников</li>
                  <li><strong>Жрец:</strong> Проводник божественной силы, специализирующийся на лечении</li>
                  <li><strong>Друид:</strong> Хранитель природы, способный превращаться в животных</li>
                  <li><strong>Воин:</strong> Мастер оружия и боевых техник</li>
                  <li><strong>Монах:</strong> Мастер боевых искусств</li>
                  <li><strong>Паладин:</strong> Священный воин, связанный клятвой</li>
                  <li><strong>Следопыт:</strong> Охотник и следопыт дикой природы</li>
                  <li><strong>Плут:</strong> Мастер скрытности и хитрости</li>
                  <li><strong>Чародей:</strong> Врожденный заклинатель с магической кровью</li>
                  <li><strong>Колдун:</strong> Заклинатель, заключивший пакт с могущественным существом</li>
                  <li><strong>Волшебник:</strong> Ученый магии, изучающий заклинания</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="races" className="space-y-4">
            <Card style={cardStyle}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2" style={textStyle}>Расы</h3>
                <p className="mb-2 text-sm" style={textStyle}>
                  Раса персонажа определяет его базовые физические и культурные особенности:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm" style={textStyle}>
                  <li><strong>Люди:</strong> Адаптивная и разнообразная раса</li>
                  <li><strong>Дварфы:</strong> Крепкие и выносливые горные жители</li>
                  <li><strong>Эльфы:</strong> Грациозные, долгоживущие обитатели лесов</li>
                  <li><strong>Полурослики:</strong> Маленькие, ловкие и удачливые существа</li>
                  <li><strong>Драконорожденные:</strong> Гуманоиды с драконьими чертами</li>
                  <li><strong>Гномы:</strong> Изобретательные маленькие существа</li>
                  <li><strong>Полуэльфы:</strong> Сочетают черты людей и эльфов</li>
                  <li><strong>Полуорки:</strong> Сильные гуманоиды со следами орочьей крови</li>
                  <li><strong>Тифлинги:</strong> Потомки людей и дьяволов</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card style={cardStyle}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2" style={textStyle}>Основные правила</h3>
                <h4 className="font-medium mt-4 mb-2" style={textStyle}>Бой</h4>
                <p className="mb-2 text-sm" style={textStyle}>
                  Бой происходит в раундах, каждый из которых длится около 6 секунд игрового времени. 
                  Порядок ходов определяется инициативой (бросок d20 + модификатор Ловкости).
                </p>
                <p className="mb-2 text-sm" style={textStyle}>
                  В свой ход персонаж может совершить действие, бонусное действие (если доступно) и перемещение.
                </p>
                
                <h4 className="font-medium mt-4 mb-2" style={textStyle}>Отдых</h4>
                <p className="mb-2 text-sm" style={textStyle}>
                  <strong>Короткий отдых:</strong> Длится 1 час. Позволяет использовать Кости Хитов для восстановления здоровья 
                  и восстанавливает некоторые способности.
                </p>
                <p className="mb-2 text-sm" style={textStyle}>
                  <strong>Продолжительный отдых:</strong> Длится 8 часов. Восстанавливает все хиты, половину потраченных Костей Хитов 
                  и большинство способностей персонажа.
                </p>
                
                <h4 className="font-medium mt-4 mb-2" style={textStyle}>Заклинания</h4>
                <p className="text-sm" style={textStyle}>
                  Заклинания требуют ячеек заклинаний соответствующего уровня. Ячейки восстанавливаются 
                  после продолжительного отдыха (для большинства классов).
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
