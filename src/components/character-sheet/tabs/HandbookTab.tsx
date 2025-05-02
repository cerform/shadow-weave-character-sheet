
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, BookOpen } from 'lucide-react';

export const HandbookTab = () => {
  const [activeSection, setActiveSection] = useState("basics");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Руководство игрока
        </h2>
        <Button variant="outline" onClick={() => window.open('/handbook', '_blank')}>
          <Book className="mr-2 h-4 w-4" />
          Открыть полный справочник
        </Button>
      </div>

      <Tabs defaultValue={activeSection} onValueChange={setActiveSection}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="basics">Основы</TabsTrigger>
          <TabsTrigger value="classes">Классы</TabsTrigger>
          <TabsTrigger value="races">Расы</TabsTrigger>
          <TabsTrigger value="rules">Правила</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-360px)] mt-4">
          <TabsContent value="basics" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Основы D&D 5e</h3>
                <p className="mb-2">
                  Dungeons & Dragons (D&D) - это ролевая настольная игра, в которой один игрок (Мастер Подземелий) руководит историей, 
                  а остальные управляют своими персонажами в этом мире.
                </p>
                <p className="mb-2">
                  Игровой процесс состоит из описания ситуаций Мастером Подземелий, решений игроков о действиях их персонажей 
                  и бросков костей для определения результата этих действий.
                </p>
                <h4 className="font-medium mt-4 mb-2">Проверки способностей</h4>
                <p>
                  Когда ваш персонаж пытается выполнить задачу, результат которой не очевиден, 
                  Мастер Подземелий может попросить вас сделать проверку способностей. Для этого бросается d20 
                  и к результату добавляется соответствующий модификатор способности.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Классы персонажей</h3>
                <p className="mb-2">
                  Класс персонажа определяет его основные способности, навыки и стиль игры. Вот краткий обзор классов:
                </p>
                <ul className="list-disc list-inside space-y-2">
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
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Расы</h3>
                <p className="mb-2">
                  Раса персонажа определяет его базовые физические и культурные особенности:
                </p>
                <ul className="list-disc list-inside space-y-2">
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
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Основные правила</h3>
                <h4 className="font-medium mt-4 mb-2">Бой</h4>
                <p className="mb-2">
                  Бой происходит в раундах, каждый из которых длится около 6 секунд игрового времени. 
                  Порядок ходов определяется инициативой (бросок d20 + модификатор Ловкости).
                </p>
                <p className="mb-2">
                  В свой ход персонаж может совершить действие, бонусное действие (если доступно) и перемещение.
                </p>
                
                <h4 className="font-medium mt-4 mb-2">Отдых</h4>
                <p className="mb-2">
                  <strong>Короткий отдых:</strong> Длится 1 час. Позволяет использовать Кости Хитов для восстановления здоровья 
                  и восстанавливает некоторые способности.
                </p>
                <p className="mb-2">
                  <strong>Продолжительный отдых:</strong> Длится 8 часов. Восстанавливает все хиты, половину потраченных Костей Хитов 
                  и большинство способностей персонажа.
                </p>
                
                <h4 className="font-medium mt-4 mb-2">Заклинания</h4>
                <p>
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
