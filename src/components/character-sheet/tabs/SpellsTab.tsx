
import React, { useContext, useState } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterContext } from "@/contexts/CharacterContext";
import { getSpellDetails } from "@/data/spells";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Book, Plus } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const SpellsTab = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group spells by level
  const spellsByLevel = character?.spells?.reduce((acc: {[key: string]: string[]}, spell: string) => {
    const spellDetails = getSpellDetails(spell);
    const level = spellDetails?.level ?? 0;
    
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(spell);
    return acc;
  }, {}) || {};

  const getLevelName = (level: number): string => {
    return level === 0 ? "Заговоры" : `${level} круг`;
  };

  const getSchoolColor = (school: string): string => {
    const schoolColors: {[key: string]: string} = {
      "Воплощение": "bg-red-500/20",
      "Ограждение": "bg-blue-500/20",
      "Иллюзия": "bg-purple-500/20",
      "Некромантия": "bg-green-500/20",
      "Призывание": "bg-amber-500/20",
      "Прорицание": "bg-cyan-500/20",
      "Очарование": "bg-pink-500/20",
      "Трансмутация": "bg-emerald-500/20",
      "Зачарование": "bg-violet-500/20"
    };
    
    return schoolColors[school] || "bg-primary/20";
  };

  // Увеличиваем рендеринг компонентов для улучшения представления деталей заклинаний
  const renderComponents = (components?: string) => {
    if (!components) return null;
    return (
      <div className="text-xs text-muted-foreground mt-1">
        <span className="font-medium">Компоненты: </span>{components}
      </div>
    );
  };

  const renderCastingTime = (castingTime?: string) => {
    if (!castingTime) return null;
    return (
      <div className="text-xs text-muted-foreground mt-1">
        <span className="font-medium">Время накладывания: </span>{castingTime}
      </div>
    );
  };

  const renderRange = (range?: string) => {
    if (!range) return null;
    return (
      <div className="text-xs text-muted-foreground mt-1">
        <span className="font-medium">Дистанция: </span>{range}
      </div>
    );
  };

  const renderDuration = (duration?: string) => {
    if (!duration) return null;
    return (
      <div className="text-xs text-muted-foreground mt-1">
        <span className="font-medium">Длительность: </span>{duration}
      </div>
    );
  };

  // Функция для использования ячейки заклинания
  const useSpellSlot = (level: number) => {
    if (!character?.spellSlots || !character.spellSlots[level]) return;
    
    const slots = {...character.spellSlots};
    if (slots[level].used < slots[level].max) {
      slots[level].used++;
      updateCharacter({ spellSlots: slots });
    }
  };

  // Функция для восстановления ячейки заклинания
  const restoreSpellSlot = (level: number) => {
    if (!character?.spellSlots || !character.spellSlots[level]) return;
    
    const slots = {...character.spellSlots};
    if (slots[level].used > 0) {
      slots[level].used--;
      updateCharacter({ spellSlots: slots });
    }
  };

  // Функция для восстановления всех ячеек заклинаний (длительный отдых)
  const restoreAllSlots = () => {
    if (!character?.spellSlots) return;
    
    const restoredSlots = Object.entries(character.spellSlots).reduce((acc, [level, slot]) => {
      acc[level] = { ...slot, used: 0 };
      return acc;
    }, {} as any);
    
    updateCharacter({ spellSlots: restoredSlots });
  };

  if (!character?.spells || character?.spells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Book className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Нет доступных заклинаний</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          У вашего персонажа еще нет заклинаний. Заклинания можно получить 
          при создании персонажа или при повышении уровня.
        </p>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить заклинание
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Заклинания</h3>
        <Button size="sm" variant="outline" onClick={() => setOpenDialog(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Добавить заклинание
        </Button>
      </div>
      
      {character?.spellSlots && Object.keys(character.spellSlots).length > 0 && (
        <Card className="p-3">
          <div className="mb-2 flex justify-between items-center">
            <h4 className="text-sm font-medium">Ячейки заклинаний</h4>
            <Button size="sm" variant="ghost" onClick={restoreAllSlots}>
              Восстановить все
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
            {Object.entries(character.spellSlots).map(([level, slot]: [string, any]) => (
              <div key={level} className="bg-primary/5 p-2 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">{level} круг</div>
                <div className="font-bold mb-1">{slot.max - slot.used}/{slot.max}</div>
                <div className="flex gap-1 justify-center">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 w-6 p-0"
                    onClick={() => useSpellSlot(Number(level))}
                    disabled={slot.max - slot.used <= 0}
                  >
                    -
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 w-6 p-0"
                    onClick={() => restoreSpellSlot(Number(level))}
                    disabled={slot.used <= 0}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <div className="space-y-6">
        {Object.entries(spellsByLevel)
          .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
          .map(([level, spellNames]) => (
            <div key={level}>
              <h4 className="font-medium mb-2">{getLevelName(Number(level))}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {spellNames.map((spell: string) => {
                  const details = getSpellDetails(spell);
                  
                  return (
                    <HoverCard key={spell}>
                      <HoverCardTrigger asChild>
                        <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">{spell}</h5>
                            {details?.school && (
                              <span className={`text-xs px-2 py-1 rounded ${getSchoolColor(details.school)}`}>
                                {details.school}
                              </span>
                            )}
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96 max-h-[80vh] overflow-auto">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg">{spell}</h4>
                            <Badge className={`${details?.school ? getSchoolColor(details.school) : ''}`}>
                              {Number(level) === 0 ? "Заговор" : `${level} круг`}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">{details?.school}</p>
                          
                          <div className="py-2">
                            {renderCastingTime(details?.castingTime)}
                            {renderRange(details?.range)}
                            {renderComponents(details?.components)}
                            {renderDuration(details?.duration)}
                          </div>
                          
                          <Separator className="my-2" />
                          
                          <div className="space-y-2">
                            <p className="text-sm">{details?.description}</p>
                            {details?.higherLevels && (
                              <div className="pt-2 text-sm">
                                <p className="font-medium">На более высоком уровне:</p>
                                <p>{details.higherLevels}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                            Классы: {details?.classes?.join(", ")}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
      
      {/* Диалог добавления заклинания */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить заклинание</DialogTitle>
            <DialogDescription>
              Выберите заклинание для добавления в список заклинаний персонажа
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Input
              placeholder="Поиск заклинаний..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <ScrollArea className="h-[50vh]">
            {/* Здесь будет список заклинаний для добавления */}
            <div className="space-y-2">
              {/* Заглушка для демонстрации */}
              <div className="p-2 bg-primary/5 hover:bg-primary/10 rounded-md cursor-pointer">
                Огненный шар
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
