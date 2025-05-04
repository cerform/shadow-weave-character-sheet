import React, { useContext, useState } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from "@/hooks/use-toast"; 
import { Wand, ZapOff, Book, Info, Search, Plus } from "lucide-react";
import { DicePanel } from '../DicePanel';
import { getSpellDetails, getAllSpells } from '@/data/spells';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CharacterSpell } from '@/types/character';
import { isString, safeJoin, isCharacterSpell, stringToSpell, convertStringsToSpells } from '@/hooks/spellbook/filterUtils';
import { useDeviceType } from '@/hooks/use-mobile';

export const SpellsTab = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [activeSpellTab, setActiveSpellTab] = useState('all');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const deviceType = useDeviceType();
  const { toast } = useToast();
  
  // Функция для получения заклинаний как строк
  const getCharacterSpellNames = (): string[] => {
    if (!character?.spells) return [];

    // Если заклинания хранятся как объекты CharacterSpell
    if (Array.isArray(character.spells) && character.spells.length > 0 && typeof character.spells[0] !== 'string') {
      return (character.spells as CharacterSpell[]).map(spell => spell.name);
    }
    
    // Если заклинания хранятся как строки
    return character.spells as string[];
  };
  
  // Функция для переключения выбора уровней заклинаний
  const toggleLevelFilter = (level: number) => {
    setSelectedLevels(prev => 
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };
  
  // Очистка фильтров
  const clearFilters = () => {
    setSelectedLevels([]);
    setSearchQuery('');
    setSchoolFilter(null);
  };
  
  // Group spells by level
  const spellsByLevel = useMemo(() => {
    const spellNames = getCharacterSpellNames();
    return spellNames?.reduce((acc: {[key: string]: string[]}, spellName: string) => {
      const spellDetails = getSpellDetails(spellName);
      const level = spellDetails?.level ?? 0;
      
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(spellName);
      return acc;
    }, {}) || {};
  }, [character?.spells]);

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
      "Преобразование": "bg-emerald-500/20",
      "Зачарование": "bg-violet-500/20"
    };
    
    return schoolColors[school] || "bg-primary/20";
  };
  
  // Улучшенный рендеринг компонентов для описания заклинаний
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
    toast({
      title: "Восстановлено",
      description: "Все ячейки заклинаний восстановлены"
    });
  };

  // Функция для добавления заклинания
  const addSpell = (spellName: string) => {
    if (!character?.spells) return;
    
    if (character.spells.includes(spellName)) {
      toast({
        title: "Внимание",
        description: "Это заклинание уже добавлено в ваш список",
        variant: "destructive"
      });
      return;
    }
    
    // Добавляем заклинание
    const updatedSpells = [...character.spells, spellName];
    updateCharacter({ spells: updatedSpells });
    
    toast({
      title: "Заклинание добавлено",
      description: `${spellName} добавлено в ваш список заклинаний.`
    });
    
    setOpenDialog(false);
  };

  // Функция для удаления заклинания
  const removeSpell = (spellName: string) => {
    if (!character?.spells) return;
    
    // Удаляем заклинание
    const updatedSpells = character.spells.filter(spell => spell !== spellName);
    updateCharacter({ spells: updatedSpells });
    
    toast({
      title: "Заклинание удалено",
      description: `${spellName} удалено из вашего списка заклинаний.`
    });
  };

  // Получаем все заклинания, сгруппированные по уровням для отображения в диалоговом окне
  const allSpellsByLevel = useMemo(() => {
    const result: {[key: string]: string[]} = {};
    
    for (let i = 0; i <= 9; i++) {
      const spellsOfLevel = getSpellsByLevel(i);
      result[i.toString()] = spellsOfLevel.map(spell => spell.name);
    }
    
    return result;
  }, []);

  // Фильтрация заклинаний для текущего отображения в зависимости от выбранных фильтров
  const filteredSpells = useMemo(() => {
    const spellNames = getCharacterSpellNames();
    if (!spellNames || spellNames.length === 0) return [];
    
    // Если есть выбранные уровни для фильтрации
    if (selectedLevels.length > 0) {
      return spellNames.filter(spellName => {
        const spellDetails = getSpellDetails(spellName);
        
        // Проверяем, соответствует ли уровень заклинания хотя бы одному из выбранных уровней
        const matchesLevel = spellDetails && selectedLevels.includes(spellDetails.level);
        
        // Проверяем, соответствует ли заклинание поисковому запросу
        const matchesSearch = !searchQuery || 
          (spellName.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Проверяем, соответствует ли заклинание фильтру по школе
        const matchesSchool = !schoolFilter || 
          (spellDetails && spellDetails.school === schoolFilter);
        
        return matchesLevel && matchesSearch && matchesSchool;
      });
    }
    
    // Если нет выбранных уровней, применяем только поиск и фильтр по школе
    return spellNames.filter(spellName => {
      const spellDetails = getSpellDetails(spellName);
      
      // Проверяем, соответствует ли заклинание поисковому запросу
      const matchesSearch = !searchQuery || 
        (spellName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Проверяем, соответствует ли заклинание фильтру по школе
      const matchesSchool = !schoolFilter || 
        (spellDetails && spellDetails.school === schoolFilter);
      
      return matchesSearch && matchesSchool;
    });
  }, [character?.spells, selectedLevels, searchQuery, schoolFilter]);

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

  // Добавляем функцию для проверки типа spell
  const isCharacterSpell = (spell: string | CharacterSpell): spell is CharacterSpell => {
    return typeof spell === 'object' && spell !== null;
  };

  // Функция для преобразования строки в CharacterSpell
  const getSpellObject = (spellName: string): CharacterSpell => {
    const spellDetails = getSpellDetails(spellName);
    if (spellDetails) return spellDetails;
    
    return {
      name: spellName,
      level: 0,
      description: "",
      school: ""
    };
  };
  
  // Функция для получения у��овня заклинания, обрабатывает строки и объекты
  const getSpellLevel = (spell: string | CharacterSpell): number => {
    if (isCharacterSpell(spell)) {
      return spell.level;
    } else {
      const details = getSpellDetails(spell);
      return details?.level || 0;
    }
  };
  
  // Функция для получения имени заклинания, обрабатывает строки и объекты
  const getSpellName = (spell: string | CharacterSpell): string => {
    if (isCharacterSpell(spell)) {
      return spell.name;
    } else {
      return spell;
    }
  };
  
  // Функция для поиска заклинания по имени, поддерживает оба типа
  const findSpellByName = (spellName: string, spells: (string | CharacterSpell)[]): boolean => {
    return spells.some(spell => {
      const name = isCharacterSpell(spell) ? spell.name : spell;
      return name.toLowerCase() === spellName.toLowerCase();
    });
  };
  
  // Функция для безопасного отображения свойства classes
  const formatClassList = (classes: string[] | string | undefined): string => {
    return safeJoin(classes);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Заклинания</h3>
        <Button size="sm" variant="outline" onClick={() => setOpenDialog(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Добавить заклинание
        </Button>
      </div>
      
      {/* Ячейки заклинаний */}
      {character?.spellSlots && Object.keys(character.spellSlots).length > 0 && (
        <Card className="p-3">
          <div className="mb-2 flex justify-between items-center">
            <h4 className="text-sm font-medium">Ячейки заклинаний</h4>
            <Button size="sm" variant="ghost" onClick={restoreAllSlots}>
              Восстановить все
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
            {Object.entries(character.spellSlots)
              .sort(([levelA], [levelB]) => parseInt(levelA) - parseInt(levelB))
              .map(([level, slot]: [string, any]) => (
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
      
      {/* Фильтры заклинаний */}
      <div className="space-y-3">
        {/* Поиск заклинаний */}
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск заклинаний..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Множественный выбор уровней заклинаний */}
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Фильтр по уровням
            </h4>
            {(selectedLevels.length > 0 || searchQuery) && (
              <Button size="sm" variant="ghost" onClick={clearFilters} className="h-7 px-2">
                <XCircle className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            )}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="flex items-center justify-center">
                <Checkbox 
                  id={`level-${i}`}
                  checked={selectedLevels.includes(i)}
                  onCheckedChange={() => toggleLevelFilter(i)}
                  className="mr-1"
                />
                <label 
                  htmlFor={`level-${i}`} 
                  className="text-xs cursor-pointer select-none"
                >
                  {i === 0 ? "Зг" : i}
                </label>
              </div>
            ))}
          </div>
          {selectedLevels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedLevels.sort((a, b) => a - b).map(level => (
                <Badge 
                  key={level} 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => toggleLevelFilter(level)}
                >
                  {level === 0 ? "Заговоры" : `${level} круг`}
                  <XCircle className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Список заклинаний с фильтрацией */}
      <div className="space-y-4">
        {/* При множественном выборе показываем все отфильтрованные заклинания */}
        {selectedLevels.length > 0 ? (
          <div>
            <h4 className="font-medium mb-2">Отфильтрованные заклинания</h4>
            {filteredSpells.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredSpells.map((spellName) => {
                  const details = getSpellDetails(spellName);
                  
                  return (
                    <HoverCard key={spellName}>
                      <HoverCardTrigger asChild>
                        <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer group">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">{spellName}</h5>
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                                {details?.level === 0 ? "Заг" : details?.level}
                              </span>
                              {details?.school && (
                                <span className={`text-xs px-2 py-1 rounded ${getSchoolColor(details.school)}`}>
                                  {details.school}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSpell(spellName);
                            }}
                            className="opacity-0 group-hover:opacity-100 mt-1"
                          >
                            Удалить
                          </Button>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96 max-h-[80vh] overflow-auto">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg">{spellName}</h4>
                            <Badge className={`${details?.school ? getSchoolColor(details.school) : ''}`}>
                              {details?.level === 0 ? "Заговор" : `${details?.level} круг`}
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
                            Классы: {formatClassList(details?.classes)}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Нет заклинаний, соответствующих выбранным фильтрам
              </p>
            )}
          </div>
        ) : (
          // Табы с уровнями заклинаний (стандартный вид)
          <Tabs value={activeSpellTab} onValueChange={setActiveSpellTab} className="w-full">
            <TabsList className={`grid ${deviceType === "mobile" ? "grid-cols-5" : "grid-cols-6 lg:grid-cols-11"} mb-4`}>
              <TabsTrigger value="all">
                Все
              </TabsTrigger>
              {Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b)).map(level => (
                <TabsTrigger key={level} value={level}>
                  {deviceType === "mobile" ? 
                    (parseInt(level) === 0 ? "Зг" : level) : 
                    (parseInt(level) === 0 ? "Заговоры" : `${level} круг`)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Контент для вкладки "Все" */}
            <TabsContent value="all">
              <div className="space-y-6">
                {Object.entries(spellsByLevel)
                  .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
                  .map(([level, spellNames]) => {
                    // Фильтруем заклинания по поисковому запросу
                    const filteredSpells = spellNames.filter(spell => 
                      searchQuery ? spell.toLowerCase().includes(searchQuery.toLowerCase()) : true
                    );
                    
                    if (filteredSpells.length === 0) return null;
                    
                    return (
                      <div key={level}>
                        <h4 className="font-medium mb-2">{getLevelName(Number(level))}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {filteredSpells.map((spell: string) => {
                            const details = getSpellDetails(spell);
                            
                            return (
                              <HoverCard key={spell}>
                                <HoverCardTrigger asChild>
                                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer group">
                                    <div className="flex justify-between items-center">
                                      <h5 className="font-medium">{spell}</h5>
                                      {details?.school && (
                                        <span className={`text-xs px-2 py-1 rounded ${getSchoolColor(details.school)}`}>
                                          {details.school}
                                        </span>
                                      )}
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeSpell(spell);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 mt-1"
                                    >
                                      Удалить
                                    </Button>
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
                                      Классы: {formatClassList(details?.classes)}
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </TabsContent>
            
            {/* Контент для вкладок по конкретным уровням */}
            {Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b)).map(level => (
              <TabsContent key={level} value={level}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {spellsByLevel[level]
                    .filter(spell => 
                      searchQuery ? spell.toLowerCase().includes(searchQuery.toLowerCase()) : true
                    )
                    .map((spell: string) => {
                      const details = getSpellDetails(spell);
                      
                      return (
                        <HoverCard key={spell}>
                          <HoverCardTrigger asChild>
                            <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer group">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium">{spell}</h5>
                                {details?.school && (
                                  <span className={`text-xs px-2 py-1 rounded ${getSchoolColor(details.school)}`}>
                                    {details.school}
                                  </span>
                                )}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSpell(spell);
                                }}
                                className="opacity-0 group-hover:opacity-100 mt-1"
                              >
                                Удалить
                              </Button>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-96 max-h-[80vh] overflow-auto">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-lg">{spell}</h4>
                                <Badge className={`${details?.school ? getSchoolColor(details.school) : ''}`}>
                                  {parseInt(level) === 0 ? "Заговор" : `${level} круг`}
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
                                Классы: {formatClassList(details?.classes)}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
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
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск заклинаний..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Выбор нескольких уровней заклинаний для фильтрации */}
            <div className="bg-muted/20 p-2 rounded-md">
              <h4 className="text-sm font-medium mb-2">Фильтр по уровням</h4>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <Checkbox 
                      id={`dialog-level-${i}`}
                      checked={selectedLevels.includes(i)}
                      onCheckedChange={() => toggleLevelFilter(i)}
                      className="mr-1"
                    />
                    <label 
                      htmlFor={`dialog-level-${i}`} 
                      className="text-xs cursor-pointer select-none"
                    >
                      {i === 0 ? "Зг" : i}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Результаты поиска с учетом множественной фильтрации */}
            <ScrollArea className="h-[40vh]">
              <div className="space-y-1">
                {/* Если выбран хотя бы один уровень, показываем заклинания этих уровней */}
                {selectedLevels.length > 0 ? (
                  selectedLevels.flatMap(level => 
                    allSpellsByLevel[level.toString()]
                      ?.filter(spell => 
                        !searchQuery || spell.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(spell => {
                        const details = getSpellDetails(spell);
                        const isAlreadyAdded = character?.spells?.includes(spell);
                        
                        return (
                          <button
                            key={spell}
                            onClick={() => addSpell(spell)}
                            disabled={isAlreadyAdded}
                            className={`w-full p-2 text-left rounded-md flex justify-between items-center ${
                              isAlreadyAdded 
                                ? 'bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                                : 'bg-primary/5 hover:bg-primary/10'
                            }`}
                          >
                            <div className="flex-1">
                              <div>{spell}</div>
                              <div className="text-xs text-muted-foreground">
                                {details?.level === 0 ? "Заговор" : `${details?.level} круг`}
                              </div>
                            </div>
                            {details?.school && (
                              <Badge className={getSchoolColor(details.school)}>
                                {details.school}
                              </Badge>
                            )}
                          </button>
                        );
                      })
                  )
                ) : (
                  // Если уровни не выбраны, показываем заклинания, сгруппированные по уровням
                  Object.entries(allSpellsByLevel).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([level, spells]) => (
                    <div key={level}>
                      <h5 className="font-medium text-sm mt-4 mb-2">
                        {parseInt(level) === 0 ? "Заговоры" : `${level} круг`}
                      </h5>
                      {spells
                        .filter(spell => 
                          !searchQuery || spell.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(spell => {
                          const details = getSpellDetails(spell);
                          const isAlreadyAdded = character?.spells?.includes(spell);
                          
                          return (
                            <button
                              key={spell}
                              onClick={() => addSpell(spell)}
                              disabled={isAlreadyAdded}
                              className={`w-full p-2 text-left rounded-md flex justify-between items-center ${
                                isAlreadyAdded 
                                  ? 'bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                                  : 'bg-primary/5 hover:bg-primary/10'
                              }`}
                            >
                              <span className="flex-1">{spell}</span>
                              {details?.school && (
                                <Badge className={getSchoolColor(details.school)}>
                                  {details.school}
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
