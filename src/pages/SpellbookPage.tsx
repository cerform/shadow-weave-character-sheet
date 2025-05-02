
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Home, Search, X, Filter, BookMarked, ArrowUp, ArrowDown } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useDeviceType } from "@/hooks/use-mobile";
import { getAllSpells, getSpellsByLevels, getSpellsBySchool } from "@/data/spells";
import { CharacterSpell } from '@/types/character';
import ThemeSelector from "@/components/character-sheet/ThemeSelector";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const schoolColors: Record<string, string> = {
  "Воплощение": "bg-red-500/20 text-red-800 dark:text-red-300",
  "Ограждение": "bg-blue-500/20 text-blue-800 dark:text-blue-300",
  "Иллюзия": "bg-purple-500/20 text-purple-800 dark:text-purple-300",
  "Некромантия": "bg-green-500/20 text-green-800 dark:text-green-300",
  "Призывание": "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  "Прорицание": "bg-cyan-500/20 text-cyan-800 dark:text-cyan-300",
  "Очарование": "bg-pink-500/20 text-pink-800 dark:text-pink-300",
  "Преобразование": "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300",
  "Зачарование": "bg-violet-500/20 text-violet-800 dark:text-violet-300",
  "Вызов": "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
};

const SpellbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allSpells = useMemo(() => getAllSpells(), []);

  // Фильтрация заклинаний
  const filteredSpells = useMemo(() => {
    let filtered = allSpells;

    // Фильтр по уровням
    if (selectedLevels.length > 0) {
      filtered = getSpellsByLevels(selectedLevels);
    }

    // Фильтр по школе
    if (selectedSchool) {
      filtered = getSpellsBySchool(selectedSchool).filter(
        spell => selectedLevels.length === 0 || selectedLevels.includes(spell.level)
      );
    }

    // Фильтр по строке поиска
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(query) || 
        (spell.description && spell.description.toLowerCase().includes(query))
      );
    }

    // Сортировка
    return [...filtered].sort((a, b) => {
      if (a.level !== b.level) {
        // Сначала сортировка по уровню
        return sortOrder === "asc" ? a.level - b.level : b.level - a.level;
      } else {
        // Затем по имени
        return sortOrder === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
    });
  }, [allSpells, searchQuery, selectedLevels, selectedSchool, sortOrder]);

  // Сброс всех фильтров
  const resetFilters = () => {
    setSelectedLevels([]);
    setSelectedSchool(null);
    setSearchQuery("");
  };

  // Переключить уровень в выборе
  const toggleLevel = (level: number) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // Форматирование уровня заклинания для отображения
  const formatSpellLevel = (level: number) => {
    if (level === 0) return "Заговор";
    return `${level}-й уровень`;
  };

  // Сокращенная версия для мобильных
  const formatSpellLevelShort = (level: number) => {
    if (level === 0) return "Загов.";
    return `${level} ур.`;
  };

  const spellCard = (spell: CharacterSpell) => {
    const schoolColor = schoolColors[spell.school] || "bg-primary/20";

    return (
      <HoverCard key={spell.name}>
        <div className="bg-card/50 border border-border/50 rounded-md p-3 hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <HoverCardTrigger asChild>
                <h3 className="font-medium text-lg text-primary cursor-pointer hover:underline">
                  {spell.name}
                </h3>
              </HoverCardTrigger>
              <div className="flex gap-2 flex-wrap mt-1">
                <Badge variant="outline" className={schoolColor}>
                  {spell.school}
                </Badge>
                <Badge variant="secondary">
                  {formatSpellLevel(spell.level)}
                </Badge>
                {spell.ritual && (
                  <Badge variant="outline" className="bg-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                    Ритуал
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground line-clamp-2 text-sm">
            {spell.description?.substring(0, 120)}
            {spell.description && spell.description.length > 120 && "..."}
          </p>
          <div className="text-xs text-muted-foreground mt-3">
            {spell.components && <span>Компоненты: {spell.components} • </span>}
            {spell.castingTime && <span>Время: {spell.castingTime} • </span>}
            {spell.duration && <span>Длительность: {spell.duration}</span>}
          </div>
        </div>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{spell.name}</h3>
              <Badge className={schoolColor}>
                {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground">{spell.school}</p>
            
            {spell.castingTime && (
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Время накладывания: </span>{spell.castingTime}
              </div>
            )}
            
            {spell.range && (
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Дистанция: </span>{spell.range}
              </div>
            )}
            
            {spell.components && (
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Компоненты: </span>{spell.components}
              </div>
            )}
            
            {spell.duration && (
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Длительность: </span>{spell.duration}
              </div>
            )}
            
            <Separator className="my-2" />
            
            <p className="text-sm">{spell.description}</p>
            
            {spell.higherLevels && (
              <div className="pt-2 text-sm">
                <span className="font-medium">На более высоком уровне: </span>
                {spell.higherLevels}
              </div>
            )}
            
            {spell.classes && (
              <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                Классы: {spell.classes.join(", ")}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <div className="container relative pb-10 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="size-6" />
          Книга заклинаний D&D 5e
        </h1>
        <p className="text-muted-foreground">
          Полный справочник заклинаний для Dungeons & Dragons 5-й редакции
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <Home className="size-4" />
            На главную
          </Button>
          <Button variant="outline" onClick={() => navigate('/handbook')} className="flex items-center gap-2">
            <BookMarked className="size-4" />
            Руководство
          </Button>
        </div>
        <div>
          <ThemeSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Фильтры (десктоп версия или открытый мобильный фильтр) */}
        {(!isMobile || isFilterOpen) && (
          <div className={`${isMobile ? 'fixed inset-0 bg-background/95 z-50 p-4 overflow-auto' : ''}`}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Фильтры</CardTitle>
                  {isMobile && (
                    <Button size="sm" variant="ghost" onClick={() => setIsFilterOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardDescription>Выберите параметры фильтрации</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Уровни заклинаний */}
                <div>
                  <Label className="text-base mb-3 block">Уровни заклинаний</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`level-${level}`} 
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleLevel(level)}
                        />
                        <label
                          htmlFor={`level-${level}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {level === 0 ? 'Заговоры' : `${level}-й уровень`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Школы магии */}
                <div className="space-y-2">
                  <Label className="text-base mb-3 block">Школа магии</Label>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      null, 
                      "Воплощение", 
                      "Ограждение", 
                      "Иллюзия", 
                      "Некромантия", 
                      "Прорицание", 
                      "Очарование", 
                      "Преобразование", 
                      "Призывание", 
                      "Вызов"
                    ].map((school) => (
                      <Button
                        key={school || 'all'}
                        variant={school === selectedSchool ? "default" : "outline"}
                        className={`justify-start ${school ? schoolColors[school] || "" : ""}`}
                        onClick={() => setSelectedSchool(school)}
                      >
                        {school || "Все школы"}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Сортировка */}
                <div className="space-y-2">
                  <Label className="text-base mb-3 block">Сортировка</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      onClick={() => setSortOrder("asc")}
                      className="flex items-center gap-1"
                    >
                      <ArrowUp className="h-4 w-4" /> По возрастанию
                    </Button>
                    <Button 
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      onClick={() => setSortOrder("desc")}
                      className="flex items-center gap-1"
                    >
                      <ArrowDown className="h-4 w-4" /> По убыванию
                    </Button>
                  </div>
                </div>
                {/* Кнопка сброса фильтров */}
                <Button 
                  variant="destructive" 
                  className="w-full mt-4"
                  onClick={resetFilters}
                >
                  Сбросить фильтры
                </Button>
                {/* Кнопка применить для мобильной версии */}
                {isMobile && (
                  <Button 
                    className="w-full mt-2"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Применить
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Основное содержимое */}
        <div className={isMobile ? 'col-span-1' : 'col-span-1'}>
          <div className="flex gap-2 items-center mb-4">
            {/* Строка поиска */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск заклинаний..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Показать фильтры на мобильном */}
            {isMobile && (
              <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Активные фильтры */}
          {(selectedLevels.length > 0 || selectedSchool || searchQuery) && (
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className="text-sm text-muted-foreground">Активные фильтры:</span>
              {selectedLevels.length > 0 && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  Уровни: {selectedLevels.map(l => l === 0 ? "З" : l).join(", ")}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedLevels([])} 
                  />
                </Badge>
              )}
              {selectedSchool && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  Школа: {selectedSchool}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedSchool(null)} 
                  />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  Поиск: {searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery("")} 
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2">
                Сбросить все
              </Button>
            </div>
          )}
          
          {/* Список заклинаний */}
          {filteredSpells.length > 0 ? (
            <div className="space-y-3">
              {/* На десктопе показываем заголовок по уровням */}
              {!isMobile && sortOrder === "asc" && selectedLevels.length !== 1 && (
                <>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                    .filter(level => 
                      selectedLevels.length === 0 || 
                      selectedLevels.includes(level)
                    )
                    .map(level => {
                      const spellsOfLevel = filteredSpells.filter(spell => spell.level === level);
                      if (spellsOfLevel.length === 0) return null;
                      
                      return (
                        <div key={level} className="mb-6">
                          <h2 className="text-lg font-medium mb-3 text-primary">
                            {formatSpellLevel(level)} 
                            <span className="text-muted-foreground text-sm ml-2">
                              ({spellsOfLevel.length})
                            </span>
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {spellsOfLevel.map(spell => (
                              <div key={spell.name}>{spellCard(spell)}</div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  }
                </>
              )}
              
              {/* В других случаях просто выводим список */}
              {(isMobile || sortOrder === "desc" || selectedLevels.length === 1) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSpells.map(spell => (
                    <div key={spell.name}>{spellCard(spell)}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-4 text-lg font-medium">Заклинания не найдены</h3>
              <p className="mt-2 text-muted-foreground">
                Попробуйте изменить параметры фильтрации или поискового запроса
              </p>
              <Button onClick={resetFilters} className="mt-4">
                Сбросить фильтры
              </Button>
            </div>
          )}
          
          {/* Количество найденных заклинаний */}
          {filteredSpells.length > 0 && (
            <p className="text-muted-foreground text-sm mt-4">
              Найдено заклинаний: {filteredSpells.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellbookPage;
