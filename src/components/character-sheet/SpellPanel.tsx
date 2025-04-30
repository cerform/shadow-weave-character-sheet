
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const SpellPanel = () => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Заклинания</h3>
        <Button size="sm" variant="outline">+ Добавить заклинание</Button>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="list">Заклинания</TabsTrigger>
          <TabsTrigger value="slots">Ячейки</TabsTrigger>
          <TabsTrigger value="add">Предыстория</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium mb-2">Заговоры</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">Луч холода</h5>
                    <p className="text-sm text-muted-foreground">Дистанция: 60 футов, Длительность: Мгновенная</p>
                  </div>
                  
                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">Малая иллюзия</h5>
                    <p className="text-sm text-muted-foreground">Дистанция: 30 футов, Длительность: 1 минута</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">1-го уровня</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">Щит</h5>
                    <p className="text-sm text-muted-foreground">Реакция, +5 КД до начала вашего следующего хода</p>
                  </div>
                  
                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">Волшебная стрела</h5>
                    <p className="text-sm text-muted-foreground">3 стрелы, каждая наносит 1d4+1 урона силой</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">2-го уровня</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">Невидимость</h5>
                    <p className="text-sm text-muted-foreground">Цель становится невидимой до окончания действия заклинания</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="slots">
          <div className="space-y-4">
            <h4 className="text-md font-medium mb-2">Ячейки заклинаний</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">1-го уровня</div>
                <div className="flex justify-center gap-2">
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">2-го уровня</div>
                <div className="flex justify-center gap-2">
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">3-го уровня</div>
                <div className="flex justify-center gap-2">
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                </div>
              </div>
            </div>
            
            <h4 className="text-md font-medium mt-6 mb-2">Другие ресурсы</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Sorcery Points</div>
                <div className="flex justify-start gap-2">
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Черты Тьмы</div>
                <div className="flex justify-start gap-2">
                  <div className="size-6 rounded-full border border-primary/50 bg-primary"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                  <div className="size-6 rounded-full border border-primary/50"></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="add">
          <div className="p-4 bg-primary/5 rounded-lg text-foreground">
            <h3 className="text-lg font-medium mb-3">Предыстория персонажа</h3>
            <p className="mb-3">
              Виксен Кроу вырос в тени великого города, где научился выживать любой ценой. Его таинственное прошлое связано с древним культом теневых магов, где он случайно обнаружил свои врожденные способности к магии.
            </p>
            <p className="mb-3">
              После случайного контакта с древним артефактом, Виксен обрел связь с сущностью из Царства Теней, которая предложила ему сделку — сила в обмен на услуги. С тех пор его магия приобрела зловещий оттенок, а сам Виксен стал искать способы использовать эту силу, сохранив при этом свою человечность.
            </p>
            <p>
              Сейчас он странствует по миру в поисках древних знаний о Царстве Теней, пытаясь понять природу своей связи и, возможно, найти способ освободиться от нее, если цена окажется слишком высокой.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
