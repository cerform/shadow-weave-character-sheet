import React, { useContext, useState } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from "@/hooks/use-toast"; 
import { Wand, ZapOff, Book, Info, Search } from "lucide-react";
import { DicePanel } from './DicePanel';
import { getSpellDetails, getAllSpells } from '@/data/spells';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CharacterSpell } from '@/types/character';
import { isString, safeJoin, isCharacterSpell, stringToSpell, convertStringsToSpells } from '@/hooks/spellbook/filterUtils';

export const SpellPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const [selectedSpellLevel, setSelectedSpellLevel] = useState<number | null>(null);
  const [isAddSpellOpen, setIsAddSpellOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  // Функция для получения заклинаний как объектов CharacterSpell
  const getCharacterSpells = (): CharacterSpell[] => {
    if (!character?.spells) return [];

    // Преобразуем смешанный массив или строки в объекты CharacterSpell
    if (Array.isArray(character.spells)) {
      return convertStringsToSpells(character.spells);
    }
    
    return [];
  };
  
  // Функция для получения имен заклинаний
  const getCharacterSpellNames = (): string[] => {
    const spells = getCharacterSpells();
    return spells.map(spell => spell.name);
  };
  
  // Группировка заклинаний по уровням
  const spellsByLevel = React.useMemo(() => {
    const spells = getCharacterSpells();
    if (!spells || spells.length === 0) {
      return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    }
    
    // Группируем заклинания по уровням
    const spellsGrouped: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    
    spells.forEach((spell) => {
      const level = spell.level || 0;
      
      if (!spellsGrouped[level]) spellsGrouped[level] = [];
      spellsGrouped[level].push(spell.name);
    });
    
    return spellsGrouped;
  }, [character?.spells]);

  // Функция для получения школы заклинания и цвета
  const getSpellSchool = (spellName: string): { name: string; color: string } => {
    const details = getSpellDetails(spellName);
    const school = details?.school || "Неизвестная";
    
    const schoolColors: Record<string, string> = {
      "Воплощение": "bg-red-500/20",
      "Ограждение": "bg-blue-500/20",
      "Иллюзия": "bg-purple-500/20",
      "Некромантия": "bg-green-500/20",
      "Призывание": "bg-amber-500/20",
      "Прорицание": "bg-cyan-500/20",
      "Очарование": "bg-pink-500/20",
      "Преобразование": "bg-emerald-500/20",
      "Зачарование": "bg-violet-500/20",
      "Вызов": "bg-yellow-500/20"
    };
    
    return {
      name: school,
      color: schoolColors[school] || "bg-primary/20"
    };
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
    
    // Проверяем на��ичие ячейки заклинания нужного уровня
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
    
    // Обновляем к��личество использованных ячеек
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

  // Функция для добавления заклинания
  const addSpell = (spellName: string) => {
    const spellNames = getCharacterSpellNames();
    if (!spellNames || !character?.spells) {
      // Создаем новый объект заклинания
      const newSpell = stringToSpell(spellName);
      updateCharacter({ spells: [newSpell] });
      
      toast({
        title: "Заклинание добавлено",
        description: `${spellName} добавлено в ваш список заклинаний`,
      });
      return;
    }
    
    // Проверяем, есть ли уже такое заклинание
    if (spellNames.includes(spellName)) {
      toast({
        title: "Внимание",
        description: `Заклинание ${spellName} уже в вашем списке`,
        variant: "destructive"
      });
      return;
    }
    
    // Получаем текущие заклинания и добавляем новое
    const currentSpells = getCharacterSpells();
    const spellToAdd = stringToSpell(spellName);
    const updatedSpells = [...currentSpells, spellToAdd];
    
    updateCharacter({ spells: updatedSpells });
    
    toast({
      title: "Заклинание добавлено",
      description: `${spellName} добавлено в ваш список заклинаний`,
    });
    
    setIsAddSpellOpen(false);
  };

  // Функция для удаления заклинания
  const removeSpell = (spellName: string) => {
    if (!character?.spells) return;
    
    const spells = getCharacterSpells();
    const updatedSpells = spells.filter(spell => spell.name !== spellName);
    
    updateCharacter({ spells: updatedSpells });
    
    toast({
      title: "Заклинание удалено",
      description: `${spellName} удалено из вашего списка заклинаний`,
    });
  };
  
  // Функция для отображения заклинаний определенного уровня
  const renderSpellsByLevel = (level: number) => {
    const spells = spellsByLevel[level] || [];
    
    if (spells.length === 0) {
      return <p className="text-sm text-muted-foreground">Нет известных заклинани�� этого уровня</p>;
    }
    
    return (
      <div className="space-y-2">
        {spells.map((spellName, index) => {
          const spellDetails = getSpellDetails(spellName);
          const school = getSpellSchool(spellName);
          
          return (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-primary">{spellName}</h5>
                    {school && (
                      <span className={`text-xs px-2 py-1 rounded ${school.color}`}>
                        {school.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSpell(spellName);
                      }}
                    >
                      <span className="sr-only">Удалить</span>
                      ✕
                    </Button>
                    
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
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{spellName}</h4>
                    <Badge className={school.color}>
                      {level === 0 ? "Заговор" : `${level} уровень`}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{school.name}</p>
                  
                  {spellDetails?.castingTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Время накладывания: </span>{spellDetails.castingTime}
                    </div>
                  )}
                  
                  {spellDetails?.range && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Дистанция: </span>{spellDetails.range}
                    </div>
                  )}
                  
                  {spellDetails?.components && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Компоненты: </span>{spellDetails.components}
                    </div>
                  )}
                  
                  {spellDetails?.duration && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Длительность: </span>{spellDetails.duration}
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm">{spellDetails?.description}</p>
                  
                  {spellDetails?.higherLevels && (
                    <div className="pt-2 text-sm">
                      <span className="font-medium">На более высоком уровне: </span>
                      {spellDetails.higherLevels}
                    </div>
                  )}
                  
                  {spellDetails?.classes && (
                    <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                      Классы: {safeJoin(spellDetails.classes)}
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    );
  };

  // Фильтрация заклинаний для диалога добавления
  const getFilteredSpells = () => {
    let allSpells = getAllSpells().map(spell => spell.name);
    
    // Фильтр по поисковому запросу
    if (searchTerm) {
      allSpells = allSpells.filter(
        spellName => spellName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтр по уровню
    if (filterLevel !== null) {
      allSpells = allSpells.filter(spellName => {
        const details = getSpellDetails(spellName);
        return details?.level === filterLevel;
      });
    }
    
    return allSpells;
  };

  // Сгруппированные заклинания для диалога добавления
  const groupedFilteredSpells = React.useMemo(() => {
    const spells = getFilteredSpells();
    const grouped: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    
    spells.forEach(spellName => {
      const details = getSpellDetails(spellName);
      const level = details?.level || 0;
      
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(spellName);
    });
    
    return grouped;
  }, [searchTerm, filterLevel]);

  // Функция для форматирования списка классов
  const formatClassList = (classes: string[] | string | undefined): string => {
    if (!classes) return "Нет данных";
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    } else if (typeof classes === 'string') {
      return classes;
    }
    
    return "Нет данных";
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Заклинания</h3>
        <Button size="sm" variant="outline" onClick={() => setIsAddSpellOpen(true)}>
          + Добавить заклинание
        </Button>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="list">Заклинания</TabsTrigger>
          <TabsTrigger value="slots">Ячейки</TabsTrigger>
          <TabsTrigger value="roll">Проверки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {!character?.spells || getCharacterSpellNames().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Book className="h-16 w-16 text-primary/30 mb-4" />
              <h4 className="text-xl font-medium mb-2">Нет заклинаний</h4>
              <p className="text-muted-foreground text-center mb-4">
                У вас пока нет изученных заклинаний. Добавьте новые заклинания, чтобы они появились здесь.
              </p>
              <Button onClick={() => setIsAddSpellOpen(true)}>
                Добавить заклинание
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Заговоры */}
                {spellsByLevel[0]?.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-2 text-primary">Заговоры</h4>
                    {renderSpellsByLevel(0)}
                  </div>
                )}
                
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
          )}
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
      
      {/* Диалог добавления заклин��ния */}
      <Dialog open={isAddSpellOpen} onOpenChange={setIsAddSpellOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить заклинание</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Поиск заклинаний..."
                  className="w-full py-2 px-4 pl-9 bg-background border border-input rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant={filterLevel === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterLevel(null)}
              >
                Все уровни
              </Badge>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                <Badge
                  key={level}
                  variant={filterLevel === level ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterLevel(level)}
                >
                  {level === 0 ? "Заговоры" : `${level} ур.`}
                </Badge>
              ))}
            </div>
            
            <ScrollArea className="h-[50vh]">
              <div className="space-y-4">
                {Object.entries(groupedFilteredSpells)
                  .filter(([_, spells]) => spells.length > 0)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([level, spells]) => (
                    <div key={level}>
                      <h4 className="text-md font-medium mb-2">
                        {Number(level) === 0 ? "Заговоры" : `${level}-го уровня`}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {spells.map(spellName => {
                          const school = getSpellSchool(spellName);
                          const alreadyAdded = character?.spells?.includes(spellName);
                          
                          return (
                            <div 
                              key={spellName}
                              className={`p-2 rounded-md flex items-center justify-between ${
                                alreadyAdded 
                                  ? 'bg-gray-200 dark:bg-gray-700 opacity-50' 
                                  : 'bg-primary/5 hover:bg-primary/10 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{spellName}</span>
                                <span className={`text-xs px-2 py-1 rounded ${school.color}`}>
                                  {school.name}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <SpellDetailsCard spellName={spellName} />
                                  </HoverCardContent>
                                </HoverCard>
                                
                                <Button
                                  size="sm"
                                  disabled={alreadyAdded}
                                  onClick={() => addSpell(spellName)}
                                >
                                  {alreadyAdded ? "Добавлено" : "Добавить"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                }
                
                {Object.values(groupedFilteredSpells).every(spells => spells.length === 0) && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Заклинания не найдены</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Компонент для отображения деталей заклинания
const SpellDetailsCard = ({ spellName }: { spellName: string }) => {
  const details = getSpellDetails(spellName);
  
  if (!details) {
    return <div>Информация о заклинании отсутствует</div>;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg">{spellName}</h4>
        <Badge className="bg-primary/20">
          {details.level === 0 ? "Заговор" : `${details.level} уровень`}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">{details.school}</p>
      
      <div className="py-2">
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Время накладывания: </span>{details.castingTime}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Дистанция: </span>{details.range}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Компоненты: </span>{details.components}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Длительность: </span>{details.duration}
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="space-y-2">
        <p className="text-sm">{details.description}</p>
        {details.higherLevels && (
          <div className="pt-2 text-sm">
            <p className="font-medium">На более высоком уровне:</p>
            <p>{details.higherLevels}</p>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
        Классы: {safeJoin(details.classes)}
      </div>
    </div>
  );
};
