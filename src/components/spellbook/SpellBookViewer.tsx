import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Search, ArrowLeft, BookOpen, Check, X } from "lucide-react";
import SpellDetailModal from "@/components/spell-detail/SpellDetailModal";
import NavigationButtons from "@/components/ui/NavigationButtons";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useNavigate } from 'react-router-dom';
import { spells as allSpells } from '@/data/spells';
import { CharacterSpell } from '@/types/character';

// Define the SpellData interface to match the structure of our spells
interface SpellData {
  id?: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes?: string | string[];
  source?: string;
  isRitual?: boolean;
  isConcentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}

const SpellBookViewer = () => {
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);

  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const navigate = useNavigate();
  
  const getBadgeColor = (level: number) => {
    // Используем теперь цвета в зависимости от выбранной темы
    const levelColors: { [key: number]: string } = {
      0: `bg-stone-800 text-white border border-${currentTheme.accent}`,
      1: `bg-blue-900 text-white border border-${currentTheme.accent}`,
      2: `bg-green-900 text-white border border-${currentTheme.accent}`,
      3: `bg-yellow-900 text-white border border-${currentTheme.accent}`,
      4: `bg-orange-900 text-white border border-${currentTheme.accent}`,
      5: `bg-red-900 text-white border border-${currentTheme.accent}`,
      6: `bg-purple-900 text-white border border-${currentTheme.accent}`,
      7: `bg-pink-900 text-white border border-${currentTheme.accent}`,
      8: `bg-indigo-900 text-white border border-${currentTheme.accent}`,
      9: `bg-cyan-900 text-white border border-${currentTheme.accent}`,
    };

    return levelColors[level] || "bg-gray-800 text-white";
  };

  const getSchoolBadgeColor = (school: string) => {
    const schoolColors: { [key: string]: string } = {
      'Преобразование': 'bg-blue-900 text-white',
      'Воплощение': 'bg-red-900 text-white',
      'Вызов': 'bg-orange-900 text-white',
      'Прорицание': 'bg-purple-900 text-white',
      'Очарование': 'bg-pink-900 text-white',
      'Иллюзия': 'bg-indigo-900 text-white',
      'Некромантия': 'bg-green-900 text-white',
      'Ограждение': 'bg-yellow-900 text-white',
    };

    return schoolColors[school] || "bg-gray-800 text-white";
  };

  // Извлекаем уникальные классы из заклинаний
  const extractClasses = (): string[] => {
    const classesSet = new Set<string>();
    
    allSpells.forEach(spell => {
      if (typeof spell.classes === 'string') {
        // Если classes - строка, разделяем её по запятым
        const classesString = spell.classes as string;
        classesString.split(',').forEach(cls => 
          classesSet.add(cls.trim())
        );
      } else if (Array.isArray(spell.classes)) {
        // Если classes - массив, добавляем каждый элемент
        spell.classes.forEach(cls => {
          if (typeof cls === 'string') {
            classesSet.add(cls.trim());
          }
        });
      }
    });
    
    return Array.from(classesSet).sort();
  };

  const allClasses = extractClasses();

  useEffect(() => {
    // Convert CharacterSpell[] to SpellData[]
    if (allSpells && allSpells.length > 0) {
      const convertedSpells: SpellData[] = allSpells.map(spell => ({
        ...spell,
        // Ensure properties match the SpellData interface
        isRitual: spell.ritual || false,
        isConcentration: spell.concentration || false
      }));
      setFilteredSpells(convertedSpells);
    } else {
      console.error('Не удалось загрузить заклинания из модуля');
      setFilteredSpells([]);
    }
  }, []);

  useEffect(() => {
    let result = [...allSpells];

    // Фильтруем по поисковому запросу
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        spell => 
          spell.name.toLowerCase().includes(term) || 
          (spell.description && spell.description.toLowerCase().includes(term)) ||
          (spell.classes && (
            (typeof spell.classes === 'string' && spell.classes.toLowerCase().includes(term)) ||
            (Array.isArray(spell.classes) && spell.classes.some(cls => {
              // Additional check to ensure cls is a string before calling toLowerCase
              return typeof cls === 'string' && cls.toLowerCase().includes(term);
            }))
          ))
      );
    }

    // Фильтруем по уровням (если выбраны уровни)
    if (activeLevel.length > 0) {
      result = result.filter(spell => activeLevel.includes(spell.level));
    }

    // Фильтруем по школам (если выбраны школы)
    if (activeSchool.length > 0) {
      result = result.filter(spell => activeSchool.includes(spell.school));
    }

    // Фильтруем по классам (если выбраны классы)
    if (activeClass.length > 0) {
      result = result.filter(spell => {
        if (typeof spell.classes === 'string') {
          // Проверяем, содержит ли строка классов хотя бы один из выбранных классов
          const spellClassesLower = spell.classes.toLowerCase();
          return activeClass.some(cls => 
            spellClassesLower.includes(cls.toLowerCase())
          );
        } else if (Array.isArray(spell.classes)) {
          // Проверяем, содержит ли массив классов хотя бы один из выбранных классов
          return spell.classes.some(spellClass => {
            if (typeof spellClass !== 'string') return false;
            return activeClass.some(cls => 
              spellClass.toLowerCase().includes(cls.toLowerCase())
            );
          });
        }
        return false;
      });
    }

    // Convert CharacterSpell[] to SpellData[]
    const convertedSpells: SpellData[] = result.map(spell => ({
      ...spell,
      isRitual: spell.ritual || false,
      isConcentration: spell.concentration || false
    }));
    
    setFilteredSpells(convertedSpells);
  }, [searchTerm, activeLevel, activeSchool, activeClass]);

  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const toggleLevel = (level: number) => {
    setActiveLevel(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const toggleSchool = (school: string) => {
    setActiveSchool(prev => {
      if (prev.includes(school)) {
        return prev.filter(s => s !== school);
      } else {
        return [...prev, school];
      }
    });
  };

  const toggleClass = (className: string) => {
    setActiveClass(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  };

  const allLevels = Array.from(new Set(allSpells.map(spell => spell.level))).sort();
  const allSchools = Array.from(new Set(allSpells.map(spell => spell.school))).sort();

  // Преобразовываем классы из массива в строку для отображения
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return '';
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    return classes;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-background/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Книга заклинаний D&D 5e
          </h1>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => navigate('/handbook')}
            className="flex items-center gap-2"
          >
            <BookOpen className="size-4" />
            Руководство игрока
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <ThemeSelector />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-accent p-4 bg-card/60">
            <h3 className="text-xl font-semibold mb-3">Поиск</h3>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Искать заклинание..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-background/50 border-accent"
                />
                <Search className="h-4 w-4 absolute top-3 left-2 text-muted-foreground" />
              </div>
              
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium mb-2">Фильтры:</h4>
                {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="text-xs flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Сбросить
                  </Button>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Уровень:</h4>
                <div className="flex flex-wrap gap-2">
                  {allLevels.map(level => (
                    <Badge
                      key={level}
                      className={`cursor-pointer ${activeLevel.includes(level) 
                        ? getBadgeColor(level)
                        : 'bg-secondary'}`}
                      onClick={() => toggleLevel(level)}
                      style={{
                        backgroundColor: activeLevel.includes(level) ? currentTheme.accent : undefined,
                        color: activeLevel.includes(level) ? currentTheme.textColor : undefined,
                        borderColor: activeLevel.includes(level) ? currentTheme.accent : undefined
                      }}
                    >
                      {level === 0 ? "Заговор" : `${level}-й`}
                      {activeLevel.includes(level) && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Школа:</h4>
                <div className="flex flex-wrap gap-2">
                  {allSchools.map(school => (
                    <Badge
                      key={school}
                      className={`cursor-pointer ${activeSchool.includes(school) 
                        ? getSchoolBadgeColor(school)
                        : 'bg-secondary'}`}
                      onClick={() => toggleSchool(school)}
                      style={{
                        backgroundColor: activeSchool.includes(school) ? currentTheme.accent : undefined,
                        color: activeSchool.includes(school) ? currentTheme.textColor : undefined,
                        borderColor: activeSchool.includes(school) ? currentTheme.accent : undefined
                      }}
                    >
                      {school}
                      {activeSchool.includes(school) && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Класс:</h4>
                <div className="flex flex-wrap gap-2">
                  {allClasses.map(className => (
                    <Badge
                      key={className}
                      className={`cursor-pointer ${activeClass.includes(className) 
                        ? 'bg-primary'
                        : 'bg-secondary'}`}
                      onClick={() => toggleClass(className)}
                      style={{
                        backgroundColor: activeClass.includes(className) ? currentTheme.accent : undefined,
                        color: activeClass.includes(className) ? currentTheme.textColor : undefined,
                        borderColor: activeClass.includes(className) ? currentTheme.accent : undefined
                      }}
                    >
                      {className}
                      {activeClass.includes(className) && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <NavigationButtons className="flex flex-col w-full" />
        </div>

        <div className="md:col-span-3">
          <Card className="border border-accent bg-card/70 h-full">
            <CardContent className="p-0">
              <div className="p-4 bg-card/60 border-b border-accent">
                <h3 className="text-xl font-semibold">
                  {filteredSpells.length} заклинаний найдено
                </h3>
              </div>
              <ScrollArea className="h-[70vh]">
                <div className="p-4 space-y-4">
                  {filteredSpells.length > 0 ? (
                    filteredSpells.map((spell, index) => (
                      <Card 
                        key={spell.id || `spell-${index}`} 
                        className="spell-card border border-accent hover:border-primary cursor-pointer transition-all"
                        onClick={() => handleOpenSpell(spell)}
                        style={{backgroundColor: `${currentTheme.cardBackground}`}}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-foreground" style={{color: currentTheme.textColor}}>{spell.name}</h4>
                            <Badge
                              className={getBadgeColor(spell.level)}
                              style={{
                                backgroundColor: currentTheme.accent,
                                color: currentTheme.textColor,
                                borderColor: currentTheme.accent
                              }}
                            >
                              {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Badge
                              className={getSchoolBadgeColor(spell.school)}
                              style={{
                                borderColor: currentTheme.accent
                              }}
                            >
                              {spell.school}
                            </Badge>
                            {(spell.isRitual || spell.ritual) && (
                              <Badge variant="outline" className="ml-2 border-accent">
                                Ритуал
                              </Badge>
                            )}
                            {(spell.isConcentration || spell.concentration) && (
                              <Badge variant="outline" className="ml-2 border-accent">
                                Концентрация
                              </Badge>
                            )}
                          </div>
                          <Separator className="my-2 bg-accent/30" />
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">Время накладывания:</span> {spell.castingTime}
                            </div>
                            <div>
                              <span className="font-semibold">Дистанция:</span> {spell.range}
                            </div>
                            <div>
                              <span className="font-semibold">Компоненты:</span> {spell.components}
                            </div>
                            <div>
                              <span className="font-semibold">Длительность:</span> {spell.duration}
                            </div>
                          </div>
                          {spell.classes && (
                            <div className="mt-2 text-sm">
                              <span className="font-semibold">Классы:</span> {formatClasses(spell.classes)}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Заклинания не найдены. Попробуйте изменить критерии поиска.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t border-border p-4 bg-card/60">
              <div className="text-sm text-muted-foreground">
                Исходник: D&D 5e Player's Handbook
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {selectedSpell && (
        <SpellDetailModal 
          open={isModalOpen} 
          onClose={handleClose} 
          spell={selectedSpell} 
        />
      )}
    </div>
  );
};

export default SpellBookViewer;
