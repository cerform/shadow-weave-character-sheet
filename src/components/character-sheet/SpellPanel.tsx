import React, { useContext, useState } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from "@/components/ui/use-toast";
import { Wand, ZapOff } from "lucide-react"; 
import { DicePanel } from './DicePanel';

export const SpellPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const [selectedSpellLevel, setSelectedSpellLevel] = useState<number | null>(null);

  // Группировка заклинаний по уровням
  const spellsByLevel = React.useMemo(() => {
    if (!character?.spells || character.spells.length === 0) {
      return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    }
    
    // Группируем заклинания по уровням
    const spellsGrouped: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    
    // Если у нас есть доступ к полной информации о заклинаниях
    if (character.spellsKnown && character.spellsKnown.length > 0) {
      character.spellsKnown.forEach(spell => {
        const level = Number(spell.level);
        if (!spellsGrouped[level]) spellsGrouped[level] = [];
        spellsGrouped[level].push(spell.name);
      });
    } else {
      // Если у нас есть только названия заклинаний, используем заглушку для уровней
      character.spells.forEach((spellName, i) => {
        // Упрощенная логика определения уровня заклинания по названию (заглушка)
        const level = getSpellLevel(spellName);
        if (!spellsGrouped[level]) spellsGrouped[level] = [];
        spellsGrouped[level].push(spellName);
      });
    }
    
    return spellsGrouped;
  }, [character?.spells, character?.spellsKnown]);

  // Функция для определения уровня заклинания
  const getSpellLevel = (spellName: string): number => {
    const knownSpells: Record<string, number> = {
      "Волшебная рука": 0,
      "Огненный снаряд": 0,
      "Свет": 0,
      "Малая иллюзия": 0,
      "Танцующие огоньки": 0,
      "Волшебный замок": 2,
      "Огненный шар": 3,
      "Щит": 1,
      "Мистический заряд": 0,
      "Лечение ран": 1,
      "Благословение": 1,
      "Чудотворство": 0,
      "Обнаружение магии": 1,
      "Маскировка": 1,
      "Понимание языков": 1,
      "Огненный Снаряд": 0,
      "Рука Магнуса": 0,
      "Ядовитое Облако": 3
    };
    
    return knownSpells[spellName] || 1; // По умолчанию предполагаем 1 уровень
  };
  
  // Обработчик применения заклинания
  const castSpell = (spellName: string, level: number) => {
    if (!character) return;
    
    // Если это заговор, его можно использовать без ячеек
    if (level === 0) {
      toast({
        title: "Заклинание произнесено",
        description: `Вы использовали заговор ${spellName}`,
      });
      return;
    }
    
    // Проверяем наличие ячеек заклинаний для этого уровня
    const spellSlots = character.spellSlots || {};
    
    if (!spellSlots[level] || spellSlots[level].max - spellSlots[level].used <= 0) {
      toast({
        title: "Ошибка применения заклинания",
        description: `У вас нет доступных ячеек ${level}-го уровня`,
        variant: "destructive"
      });
      return;
    }
    
    // Обновляем количество использованных ячеек
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = { 
      ...updatedSpellSlots[level], 
      used: updatedSpellSlots[level].used + 1 
    };
    
    updateCharacter({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Заклинание произнесено",
      description: `Вы использовали ${spellName} (${level} уровень). Осталось ячеек: ${updatedSpellSlots[level].max - updatedSpellSlots[level].used}`,
    });
  };
  
  // Преобразование очков чародея в ячейки заклинаний
  const convertSorceryPoints = (spellLevel: number) => {
    if (!character) return;
    
    // Стоимость создания ячейки заклинания в очках чародея
    const costMap: Record<number, number> = {
      1: 2,
      2: 3,
      3: 5,
      4: 6, 
      5: 7
    };
    
    const cost = costMap[spellLevel];
    
    if (!cost) {
      toast({
        title: "Ошибка",
        description: "Невозможно создать ячейку этого уровня",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, достаточно ли очков чародея
    const currentPoints = character.sorceryPoints?.current || 0;
    
    if (currentPoints < cost) {
      toast({
        title: "Недостаточно очков чародея",
        description: `Требуется ${cost} очков, у вас ${currentPoints}`,
        variant: "destructive"
      });
      return;
    }
    
    // Создаём новую ячейку заклинания
    const updatedSpellSlots = { ...character.spellSlots };
    
    if (!updatedSpellSlots[spellLevel]) {
      updatedSpellSlots[spellLevel] = { max: 0, used: 0 };
    }
    
    updatedSpellSlots[spellLevel].max += 1;
    
    // Обновляем очки чародея
    const updatedSorceryPoints = {
      ...character.sorceryPoints,
      current: currentPoints - cost
    };
    
    updateCharacter({ 
      spellSlots: updatedSpellSlots,
      sorceryPoints: updatedSorceryPoints
    });
    
    toast({
      title: "Ячейка создана",
      description: `Вы создали ячейку ${spellLevel} уровня за ${cost} очков чародея`
    });
  };
  
  // Преобразование ячеек заклинаний в очки чародея
  const convertSpellSlotToSorceryPoints = (spellLevel: number) => {
    if (!character) return;
    
    // Проверяем наличие ячейки заклинания нужного уровня
    const spellSlots = character.spellSlots || {};
    
    if (!spellSlots[spellLevel] || spellSlots[spellLevel].max - spellSlots[spellLevel].used <= 0) {
      toast({
        title: "Ошибка конвертации",
        description: `У вас нет доступных ячеек ${spellLevel}-го уровня`,
        variant: "destructive"
      });
      return;
    }
    
    // Получаем очки чародея за ячейку (по уровню ячейки)
    const pointsGained = spellLevel;
    
    // Обновляем количество использованных ячеек
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[spellLevel] = { 
      ...updatedSpellSlots[spellLevel], 
      used: updatedSpellSlots[spellLevel].used + 1 
    };
    
    // Обновляем очки чародея
    const currentPoints = character.sorceryPoints?.current || 0;
    const maxPoints = character.sorceryPoints?.max || character.level || 0;
    
    const updatedSorceryPoints = {
      current: Math.min(currentPoints + pointsGained, maxPoints),
      max: maxPoints
    };
    
    updateCharacter({ 
      spellSlots: updatedSpellSlots,
      sorceryPoints: updatedSorceryPoints
    });
    
    toast({
      title: "Конвертация успешна",
      description: `Вы получили ${pointsGained} очков чародея`
    });
  };
  
  // Функция вывода статуса ячеек заклинаний
  const renderSpellSlots = () => {
    if (!character?.spellSlots || Object.keys(character.spellSlots).length === 0) {
      return <div className="text-center py-4 text-primary/80">Нет доступных ячеек заклинаний</div>;
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(character.spellSlots).map(([level, slot]) => {
          const usedCount = slot.used;
          const maxCount = slot.max;
          if (maxCount === 0) return null;
          
          return (
            <div key={level} className="p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">{level}-го уровня</div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: maxCount }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`size-6 rounded-full border border-primary/50 ${i < maxCount - usedCount ? 'bg-primary' : ''}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Отображение очков чародея, если они есть
  const renderSorceryPoints = () => {
    if (!character?.sorceryPoints || character.sorceryPoints.max === 0) {
      return null;
    }
    
    const { current, max } = character.sorceryPoints;
    
    return (
      <div>
        <h4 className="text-md font-medium mt-6 mb-2 text-primary">Очки чародея</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Очки чародея</div>
            <div className="flex justify-start gap-2">
              {Array.from({ length: max }).map((_, i) => (
                <div 
                  key={i} 
                  className={`size-6 rounded-full border border-primary/50 ${i < current ? 'bg-primary' : ''}`}
                />
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Доступно</div>
            <div className="text-xl font-bold text-primary">{current}/{max}</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-md font-medium text-primary">Метамагия</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" disabled={current < 1}>
              Осторожное заклинание (1)
            </Button>
            <Button variant="outline" size="sm" disabled={current < 1}>
              Усиленное заклинание (1)
            </Button>
            <Button variant="outline" size="sm" disabled={current < 1}>
              Увеличенное заклинание (1)
            </Button>
            <Button variant="outline" size="sm" disabled={current < 2}>
              Отдалённое заклинание (2)
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Функция для отображения заклинаний определенного уровня
  const renderSpellsByLevel = (level: number) => {
    const spells = spellsByLevel[level] || [];
    
    if (spells.length === 0) {
      return <p className="text-sm text-muted-foreground">Нет известных заклинаний этого уровня</p>;
    }
    
    return (
      <div className="space-y-2">
        {spells.map((spellName, index) => (
          <div 
            key={index} 
            className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer flex justify-between items-center"
          >
            <h5 className="font-medium text-primary">{spellName}</h5>
            {level === 0 ? (
              <Button size="sm" variant="outline" onClick={() => castSpell(spellName, level)}>
                <Wand className="h-4 w-4 mr-1" />
                Использовать
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Wand className="h-4 w-4 mr-1" />
                    Произнести
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Использовать заклинание {spellName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Выберите уровень ячейки заклинания:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(character?.spellSlots || {})
                        .filter(([slotLevel, slot]) => Number(slotLevel) >= level && slot.max - slot.used > 0)
                        .map(([slotLevel, _]) => (
                          <Button 
                            key={slotLevel}
                            variant={selectedSpellLevel === Number(slotLevel) ? "default" : "outline"}
                            onClick={() => setSelectedSpellLevel(Number(slotLevel))}
                          >
                            {slotLevel} уровень
                          </Button>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="default" 
                        disabled={selectedSpellLevel === null}
                        onClick={() => {
                          if (selectedSpellLevel !== null) {
                            castSpell(spellName, selectedSpellLevel);
                            setSelectedSpellLevel(null);
                          }
                        }}
                      >
                        Применить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Заклинания</h3>
        <Button size="sm" variant="outline">+ Добавить заклинание</Button>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="list">Заклинания</TabsTrigger>
          <TabsTrigger value="slots">Ячейки</TabsTrigger>
          <TabsTrigger value="roll">Проверки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {/* Заговоры */}
              <div>
                <h4 className="text-md font-medium mb-2 text-primary">Заговоры</h4>
                {renderSpellsByLevel(0)}
              </div>
              
              {/* Заклинания по уровням */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                if (spellsByLevel[level]?.length > 0) {
                  return (
                    <div key={level}>
                      <h4 className="text-md font-medium mb-2 text-primary">{level}-го уровня</h4>
                      {renderSpellsByLevel(level)}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="slots">
          <div className="space-y-4">
            <h4 className="text-md font-medium mb-2 text-primary">Ячейки заклинаний</h4>
            {renderSpellSlots()}
            
            {/* Отображаем очки чародея, если они есть */}
            {renderSorceryPoints()}
            
            {/* Конвертация очков и ячеек */}
            {character?.sorceryPoints && character.sorceryPoints.max > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2 text-primary">Конвертация ресурсов</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-primary/90">Создать ячейку</h5>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <Button 
                          key={level} 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          disabled={character.sorceryPoints.current < level + 1}
                          onClick={() => convertSorceryPoints(level)}
                        >
                          <Wand className="h-4 w-4 mr-1" />
                          {level} уровень ({level + 1} очков)
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-primary/90">Получить очки</h5>
                    <div className="space-y-2">
                      {Object.keys(character.spellSlots || {}).map(level => {
                        const slot = character.spellSlots[Number(level)];
                        const available = slot.max - slot.used > 0;
                        
                        return Number(level) > 0 ? (
                          <Button 
                            key={level} 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            disabled={!available}
                            onClick={() => convertSpellSlotToSorceryPoints(Number(level))}
                          >
                            <ZapOff className="h-4 w-4 mr-1" />
                            {level} уровень ({level} очков)
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="roll">
          <DicePanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
