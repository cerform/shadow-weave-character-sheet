
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, BookOpen } from 'lucide-react';

export const HandbookTab = () => {
  const [activeSection, setActiveSection] = useState("equipment");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Book className="mr-2 h-5 w-5" />
          Справочник
        </h2>
        <Button variant="outline" onClick={() => window.open('/handbook', '_blank')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Открыть полный справочник
        </Button>
      </div>

      <Tabs defaultValue={activeSection} onValueChange={setActiveSection}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
          <TabsTrigger value="spells">Заклинания</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-360px)] mt-4">
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Снаряжение и оружие</h3>
                <p className="mb-2">
                  В мире D&D доступно множество различных видов оружия, брони и снаряжения.
                </p>
                <h4 className="font-medium mt-4 mb-2">Оружие</h4>
                <p className="mb-2">
                  Оружие делится на простое и воинское. Простое оружие доступно большинству классов, 
                  а воинское требует специального навыка.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Рукопашное оружие:</strong> Мечи, топоры, булавы, копья и т.д.</li>
                  <li><strong>Дальнобойное оружие:</strong> Луки, арбалеты, пращи и т.д.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spells" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Заклинания</h3>
                <p className="mb-2">
                  Заклинания в D&D делятся на уровни от 0 (заговоры) до 9. Каждый класс заклинателя 
                  имеет свой список доступных заклинаний.
                </p>
                <h4 className="font-medium mt-4 mb-2">Школы магии:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Воплощение:</strong> Заклинания, создающие энергию или материю</li>
                  <li><strong>Ограждение:</strong> Защитные заклинания</li>
                  <li><strong>Преобразование:</strong> Заклинания, изменяющие форму или свойства</li>
                  <li><strong>Прорицание:</strong> Заклинания для получения информации</li>
                  <li><strong>Вызов:</strong> Заклинания для призыва существ или объектов</li>
                  <li><strong>Некромантия:</strong> Заклинания связанные со смертью и нежитью</li>
                  <li><strong>Иллюзия:</strong> Заклинания создающие иллюзии</li>
                  <li><strong>Очарование:</strong> Заклинания, контролирующие разум</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
