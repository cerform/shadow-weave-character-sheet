
import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharacterSpell } from '@/types/character';
import { spells, getAllSpells } from '@/data/spells';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationButtons from '@/components/ui/NavigationButtons';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Separator } from '@/components/ui/separator';
import { Filter, Check, BookOpen } from "lucide-react";
import ThemeSelector from '@/components/character-sheet/ThemeSelector';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

const spellSchools = [
  "Вызов",
  "Воплощение",
  "Иллюзия",
  "Некромантия",
  "Ограждение",
  "Очарование",
  "Преобразование",
  "Прорицание",
];

const spellClasses = [
  "Бард",
  "Волшебник",
  "Друид",
  "Жрец",
  "Колдун",
  "Паладин",
  "Следопыт",
  "Чародей",
  "Искуситель"
];

const SpellBookViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showRitualOnly, setShowRitualOnly] = useState(false);
  const [showConcentrationOnly, setShowConcentrationOnly] = useState(false);
  const [showVerbalOnly, setShowVerbalOnly] = useState(false);
  const [showSomaticOnly, setShowSomaticOnly] = useState(false);
  const [showMaterialOnly, setShowMaterialOnly] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isSpellDialogOpen, setIsSpellDialogOpen] = useState(false);
  
  const { theme } = useTheme();
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const allSpells = useMemo(() => getAllSpells(), []);

  const toggleLevel = (level: number) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // Функция для получения цвета уровня заклинания в соответствии с темой
  const getLevelColor = (level: number) => {
    // Базовый цвет темы
    const baseColor = currentTheme.accent;
    
    // Определяем цвет в зависимости от уровня
    switch(level) {
      case 0: // Заговоры
        return `${baseColor}`;
      case 1:
        return `${baseColor}`;
      case 2:
        return `${baseColor}`;
      case 3:
        return `${baseColor}`;
      case 4:
        return `${baseColor}`;
      case 5:
        return `${baseColor}`;
      case 6:
        return `${baseColor}`;
      case 7:
        return `${baseColor}`;
      case 8:
        return `${baseColor}`;
      case 9:
        return `${baseColor}`;
      default:
        return `${baseColor}`;
    }
  };

  const filteredSpells = useMemo(() => {
    return allSpells.filter(spell => {
      // Text search
      if (searchTerm && !spell.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Level filter - если выбраны уровни, проверяем вхождение
      if (selectedLevels.length > 0 && !selectedLevels.includes(spell.level)) {
        return false;
      }
      
      // School filter
      if (selectedSchool !== 'all' && spell.school !== selectedSchool) {
        return false;
      }
      
      // Class filter
      if (selectedClass !== 'all' && !spell.classes.includes(selectedClass)) {
        return false;
      }
      
      // Component filters
      if (showRitualOnly && !spell.ritual) {
        return false;
      }
      
      if (showConcentrationOnly && !spell.concentration) {
        return false;
      }
      
      if (showVerbalOnly && !spell.verbal) {
        return false;
      }
      
      if (showSomaticOnly && !spell.somatic) {
        return false;
      }
      
      if (showMaterialOnly && !spell.material) {
        return false;
      }
      
      return true;
    });
  }, [
    searchTerm, 
    selectedLevels, 
    selectedSchool, 
    selectedClass,
    showRitualOnly,
    showConcentrationOnly,
    showVerbalOnly,
    showSomaticOnly,
    showMaterialOnly,
    allSpells
  ]);

  // Функция для группировки заклинаний по уровням
  const spellsByLevel = useMemo(() => {
    const grouped: { [key: string]: CharacterSpell[] } = {};
    
    filteredSpells.forEach(spell => {
      const level = spell.level;
      const levelKey = level === 0 ? 'cantrips' : `level-${level}`;
      
      if (!grouped[levelKey]) {
        grouped[levelKey] = [];
      }
      
      grouped[levelKey].push(spell);
    });
    
    // Сортируем заклинания внутри каждого уровня по имени
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }, [filteredSpells]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLevels([]);
    setSelectedSchool('all');
    setSelectedClass('all');
    setShowRitualOnly(false);
    setShowConcentrationOnly(false);
    setShowVerbalOnly(false);
    setShowSomaticOnly(false);
    setShowMaterialOnly(false);
  };

  // Получаем количество заклинаний для каждого уровня
  const getSpellCountByLevel = (level: number) => {
    return allSpells.filter(spell => spell.level === level).length;
  };

  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  // Функция для открытия диалога с подробностями о заклинании
  const handleOpenSpellDetails = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsSpellDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center" style={{ color: currentTheme.textColor }}>D&D 5e Книга заклинаний</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                asChild
                className="flex items-center gap-2"
              >
                <Link to='/handbook'>
                  <BookOpen className="size-4" />
                  Руководство игрока
                </Link>
              </Button>
              <NavigationButtons />
            </div>
            <ThemeSelector />
          </div>
        </div>
        
        <div className="flex gap-4">
          {/* Боковая панель фильтров */}
          <div className={`bg-background/25 backdrop-blur-sm border border-primary/20 rounded-lg shadow-md transition-all duration-300 ${showFilterPanel ? 'w-72 p-4' : 'w-10 p-2'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold flex gap-2 items-center ${!showFilterPanel && 'hidden'}`} style={{ color: currentTheme.accent }}>
                <Filter size={18} /> Фильтры
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFilterPanel}
                className={`p-1 ${!showFilterPanel && 'w-full'}`}
              >
                {showFilterPanel ? '←' : <Filter size={16} />}
              </Button>
            </div>
            
            {showFilterPanel && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Уровень (множественный выбор)</h3>
                  <div className="flex flex-wrap gap-1">
                    <ToggleGroup type="multiple" className="flex flex-wrap gap-1" variant="outline">
                      <ToggleGroupItem 
                        value="0"
                        data-state={selectedLevels.includes(0) ? "on" : "off"}
                        onClick={() => toggleLevel(0)}
                        className="text-xs"
                        style={{
                          backgroundColor: selectedLevels.includes(0) ? `${currentTheme.accent}30` : '',
                          color: selectedLevels.includes(0) ? currentTheme.accent : ''
                        }}
                      >
                        Заг. ({getSpellCountByLevel(0)})
                      </ToggleGroupItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                        <ToggleGroupItem 
                          key={level}
                          value={level.toString()}
                          data-state={selectedLevels.includes(level) ? "on" : "off"}
                          onClick={() => toggleLevel(level)}
                          className="text-xs"
                          style={{
                            backgroundColor: selectedLevels.includes(level) ? `${currentTheme.accent}30` : '',
                            color: selectedLevels.includes(level) ? currentTheme.accent : ''
                          }}
                        >
                          {level} ({getSpellCountByLevel(level)})
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Школа магии</h3>
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      size="sm"
                      variant={selectedSchool === 'all' ? "default" : "outline"}
                      onClick={() => setSelectedSchool('all')}
                      className="text-xs"
                      style={selectedSchool === 'all' ? { backgroundColor: currentTheme.accent + '99', color: currentTheme.textColor } : {}}
                    >
                      Все
                    </Button>
                    {spellSchools.map(school => (
                      <Button 
                        key={school}
                        size="sm"
                        variant={selectedSchool === school ? "default" : "outline"}
                        onClick={() => setSelectedSchool(school)}
                        className="text-xs"
                        style={selectedSchool === school ? { backgroundColor: currentTheme.accent + '99', color: currentTheme.textColor } : {}}
                      >
                        {school}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Класс</h3>
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      size="sm"
                      variant={selectedClass === 'all' ? "default" : "outline"}
                      onClick={() => setSelectedClass('all')}
                      className="text-xs"
                      style={selectedClass === 'all' ? { backgroundColor: currentTheme.accent + '99', color: currentTheme.textColor } : {}}
                    >
                      Все
                    </Button>
                    {spellClasses.map(className => (
                      <Button 
                        key={className}
                        size="sm"
                        variant={selectedClass === className ? "default" : "outline"}
                        onClick={() => setSelectedClass(className)}
                        className="text-xs"
                        style={selectedClass === className ? { backgroundColor: currentTheme.accent + '99', color: currentTheme.textColor } : {}}
                      >
                        {className}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Компоненты</h3>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="ritual" 
                        checked={showRitualOnly}
                        onCheckedChange={(checked) => setShowRitualOnly(checked as boolean)}
                        style={{
                          borderColor: currentTheme.accent,
                          ['--checkbox-checked-bg' as any]: currentTheme.accent,
                        }}
                      />
                      <label htmlFor="ritual" className="text-sm" style={{ color: currentTheme.textColor }}>
                        Только ритуалы
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="concentration" 
                        checked={showConcentrationOnly}
                        onCheckedChange={(checked) => setShowConcentrationOnly(checked as boolean)}
                        style={{
                          borderColor: currentTheme.accent,
                          ['--checkbox-checked-bg' as any]: currentTheme.accent,
                        }}
                      />
                      <label htmlFor="concentration" className="text-sm" style={{ color: currentTheme.textColor }}>
                        Требует концентрации
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="verbal" 
                        checked={showVerbalOnly}
                        onCheckedChange={(checked) => setShowVerbalOnly(checked as boolean)}
                        style={{
                          borderColor: currentTheme.accent,
                          ['--checkbox-checked-bg' as any]: currentTheme.accent,
                        }}
                      />
                      <label htmlFor="verbal" className="text-sm" style={{ color: currentTheme.textColor }}>
                        Вербальный компонент (В)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="somatic" 
                        checked={showSomaticOnly}
                        onCheckedChange={(checked) => setShowSomaticOnly(checked as boolean)}
                        style={{
                          borderColor: currentTheme.accent,
                          ['--checkbox-checked-bg' as any]: currentTheme.accent,
                        }}
                      />
                      <label htmlFor="somatic" className="text-sm" style={{ color: currentTheme.textColor }}>
                        Соматический компонент (С)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="material" 
                        checked={showMaterialOnly}
                        onCheckedChange={(checked) => setShowMaterialOnly(checked as boolean)}
                        style={{
                          borderColor: currentTheme.accent,
                          ['--checkbox-checked-bg' as any]: currentTheme.accent,
                        }}
                      />
                      <label htmlFor="material" className="text-sm" style={{ color: currentTheme.textColor }}>
                        Материальный компонент (М)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={resetFilters} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    style={{
                      borderColor: currentTheme.accent,
                      color: currentTheme.textColor
                    }}
                  >
                    Сбросить все фильтры
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Основная область контента */}
          <div className="bg-background/25 backdrop-blur-sm p-6 rounded-lg shadow-md border border-primary/20 mb-6 flex-1">
            <Tabs defaultValue="by-level" className="w-full">
              <TabsList className="mb-4 mx-auto">
                <TabsTrigger value="by-level" style={{color: currentTheme.textColor}}>По уровням</TabsTrigger>
                <TabsTrigger value="all" style={{color: currentTheme.textColor}}>Все заклинания</TabsTrigger>
                <TabsTrigger value="search" style={{color: currentTheme.textColor}}>Поиск</TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Input
                    placeholder="Поиск заклинания..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-background/50 max-w-sm"
                  />
                  
                  <div className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
                    Найдено: {filteredSpells.length} из {allSpells.length}
                  </div>
                </div>
                
                {filteredSpells.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-medium" style={{ color: currentTheme.textColor }}>Заклинания не найдены</p>
                    <p style={{ color: currentTheme.mutedTextColor }}>Попробуйте изменить параметры поиска</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(spellsByLevel).map(([levelKey, levelSpells]) => (
                      <div key={levelKey} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.accent }}>
                          {levelKey === 'cantrips' ? 'Заговоры' : `${levelKey.split('-')[1]} уровень`}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {levelSpells.map((spell) => (
                            <SpellCard 
                              key={spell.name} 
                              spell={spell}
                              onClick={() => handleOpenSpellDetails(spell)}
                              themeColor={getLevelColor(spell.level)}
                              currentTheme={currentTheme}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="by-level">
                <div className="space-y-8">
                  {/* Заговоры */}
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ color: currentTheme.accent, borderColor: `${currentTheme.accent}50` }}>
                      Заговоры (0 уровень)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                      {allSpells
                        .filter(spell => spell.level === 0)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(spell => (
                          <SpellLinkCard 
                            key={spell.name} 
                            spell={spell} 
                            onClick={() => handleOpenSpellDetails(spell)}
                            themeColor={getLevelColor(spell.level)}
                            currentTheme={currentTheme}
                          />
                        ))}
                    </div>
                  </div>
                  
                  {/* 1-9 уровни */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                    const levelSpells = allSpells.filter(spell => spell.level === level);
                    if (levelSpells.length === 0) return null;
                    
                    return (
                      <div key={level}>
                        <h2 
                          className="text-2xl font-semibold mb-4 border-b pb-2" 
                          style={{ 
                            color: currentTheme.accent, 
                            borderColor: `${currentTheme.accent}50` 
                          }}
                        >
                          {level} уровень
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                          {levelSpells
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(spell => (
                              <SpellLinkCard 
                                key={spell.name} 
                                spell={spell} 
                                onClick={() => handleOpenSpellDetails(spell)}
                                themeColor={getLevelColor(spell.level)}
                                currentTheme={currentTheme}
                              />
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="all">
                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allSpells
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((spell) => (
                          <SpellCard 
                            key={spell.name} 
                            spell={spell}
                            onClick={() => handleOpenSpellDetails(spell)} 
                            themeColor={getLevelColor(spell.level)}
                            currentTheme={currentTheme}
                          />
                        ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Модальное окно с детальной информацией о заклинании */}
        <Dialog open={isSpellDialogOpen} onOpenChange={setIsSpellDialogOpen}>
          <DialogContent 
            className="sm:max-w-md md:max-w-lg"
            style={{
              backgroundColor: `${currentTheme.cardBackground || "rgba(0, 0, 0, 0.7)"}`,
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between" style={{ color: currentTheme.accent }}>
                <div className="flex items-center">
                  {selectedSpell?.name}
                  <Badge 
                    className="ml-2" 
                    style={{ 
                      backgroundColor: selectedSpell ? getLevelColor(selectedSpell.level) : currentTheme.accent,
                      color: currentTheme.textColor
                    }}
                  >
                    {selectedSpell?.level === 0 ? 'Заговор' : `${selectedSpell?.level} уровень`}
                  </Badge>
                </div>
                {selectedSpell?.ritual && (
                  <Badge 
                    variant="outline" 
                    className="ml-2"
                    style={{
                      borderColor: currentTheme.accent,
                      color: currentTheme.accent
                    }}
                  >
                    Ритуал
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription style={{ color: currentTheme.mutedTextColor }}>{selectedSpell?.school}</DialogDescription>
            </DialogHeader>
            
            {selectedSpell && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>Время накладывания:</p>
                    <p className="text-sm" style={{ color: currentTheme.textColor }}>{selectedSpell.castingTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>Дистанция:</p>
                    <p className="text-sm" style={{ color: currentTheme.textColor }}>{selectedSpell.range}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>Компоненты:</p>
                    <p className="text-sm" style={{ color: currentTheme.textColor }}>
                      {[
                        selectedSpell.verbal ? 'В' : '',
                        selectedSpell.somatic ? 'С' : '',
                        selectedSpell.material ? 'М' : ''
                      ].filter(Boolean).join(', ')}
                      {selectedSpell.material && ' (материальные компоненты)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>Длительность:</p>
                    <p className="text-sm" style={{ color: currentTheme.textColor }}>
                      {selectedSpell.concentration ? 'Концентрация, ' : ''}
                      {selectedSpell.duration}
                    </p>
                  </div>
                </div>
                
                <Separator style={{ backgroundColor: `${currentTheme.accent}50` }} />
                
                <div>
                  <p className="text-sm whitespace-pre-line" style={{ color: currentTheme.textColor }}>{selectedSpell.description}</p>
                </div>
                
                {selectedSpell.higherLevels && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>На более высоком уровне:</p>
                    <p className="text-sm" style={{ color: currentTheme.textColor }}>{selectedSpell.higherLevels}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>Классы:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSpell.classes.map(cls => (
                      <Badge 
                        key={cls} 
                        variant="outline"
                        style={{
                          borderColor: `${currentTheme.accent}50`,
                          color: currentTheme.accent
                        }}
                      >
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

// Компонент для отображения подробной карточки заклинания
const SpellCard: React.FC<{ 
  spell: CharacterSpell; 
  onClick?: () => void;
  themeColor?: string;
  currentTheme: any;
}> = ({ spell, onClick, themeColor, currentTheme }) => {
  const getComponentString = () => {
    const components = [];
    if (spell.verbal) components.push('В');
    if (spell.somatic) components.push('С');
    if (spell.material) components.push('М');
    
    let result = components.join(', ');
    
    // Если есть материальный компонент, просто указываем, что он есть
    if (spell.material) {
      result += ' (материальные компоненты)';
    }
    
    return result;
  };

  return (
    <Card 
      className="p-4 h-full border bg-background/40 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      style={{
        borderColor: `${currentTheme.accent}30`,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold" style={{ color: currentTheme.accent }}>{spell.name}</h3>
        <Badge 
          className="text-xs"
          style={{ 
            backgroundColor: themeColor ? themeColor + '90' : currentTheme.accent + '90',
            color: currentTheme.textColor
          }}
        >
          {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
        </Badge>
      </div>
      
      <p className="text-sm mb-2" style={{ color: currentTheme.mutedTextColor }}>{spell.school}</p>
      
      <div className="space-y-1 mb-3">
        <p className="text-sm" style={{ color: currentTheme.textColor }}>
          <span className="font-medium" style={{ color: currentTheme.accent }}>Время:</span> {spell.castingTime}
          {spell.ritual && <span className="ml-1 italic">(ритуал)</span>}
        </p>
        
        <p className="text-sm" style={{ color: currentTheme.textColor }}>
          <span className="font-medium" style={{ color: currentTheme.accent }}>Дистанция:</span> {spell.range}
        </p>
        
        <p className="text-sm" style={{ color: currentTheme.textColor }}>
          <span className="font-medium" style={{ color: currentTheme.accent }}>Компоненты:</span> {getComponentString()}
        </p>
        
        <p className="text-sm" style={{ color: currentTheme.textColor }}>
          <span className="font-medium" style={{ color: currentTheme.accent }}>Длительность:</span> {spell.duration}
          {spell.concentration && <span className="ml-1 italic">(концентрация)</span>}
        </p>
      </div>
      
      <Separator className="my-2" style={{ backgroundColor: currentTheme.accent + '40' }} />
      
      <div className="mt-2">
        <p className="text-sm line-clamp-3" style={{ color: currentTheme.textColor }} title={spell.description}>
          {spell.description}
        </p>
      </div>
      
      {spell.higherLevels && (
        <div className="mt-2">
          <p className="text-sm font-medium" style={{ color: currentTheme.accent }}>На более высоком уровне:</p>
          <p className="text-sm line-clamp-2" style={{ color: currentTheme.textColor }} title={spell.higherLevels}>
            {spell.higherLevels}
          </p>
        </div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1">
        {spell.classes?.map(className => (
          <span 
            key={className} 
            className="text-xs px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: `${currentTheme.accent}20`,
              color: currentTheme.accent
            }}
          >
            {className}
          </span>
        ))}
      </div>
    </Card>
  );
};

// Компонент для отображения сокращённой карточки заклинания в списке по уровням
const SpellLinkCard: React.FC<{ 
  spell: CharacterSpell; 
  onClick?: () => void;
  themeColor?: string;
  currentTheme: any;
}> = ({ spell, onClick, themeColor, currentTheme }) => {
  // Формируем строку компонентов (В, С, М)
  const getComponentIcons = () => {
    let result = '';
    if (spell.verbal) result += 'В';
    if (spell.somatic) result += 'С';
    if (spell.material) result += 'М';
    return result;
  };
  
  // Добавляем индикаторы для ритуалов и концентрации
  const getAdditionalIcons = () => {
    let result = '';
    if (spell.ritual) result += ' Р';
    if (spell.concentration) result += ' К';
    return result;
  };

  // Создаем детальное содержимое для всплывающей подсказки
  const tooltipContent = (
    <div className="space-y-2 max-w-md">
      <div className="flex justify-between items-center">
        <h4 className="font-bold">{spell.name}</h4>
        <Badge 
          variant="outline" 
          className="ml-2"
          style={{
            borderColor: themeColor || currentTheme.accent,
            color: themeColor || currentTheme.accent
          }}
        >
          {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
        </Badge>
      </div>
      
      <p className="text-xs">{spell.school}</p>
      
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>
          <span className="font-medium">Время накладывания:</span> {spell.castingTime}
          {spell.ritual && <span className="ml-1 italic">(ритуал)</span>}
        </div>
        <div>
          <span className="font-medium">Дистанция:</span> {spell.range}
        </div>
        <div>
          <span className="font-medium">Компоненты:</span> {getComponentIcons()}
        </div>
        <div>
          <span className="font-medium">Длительность:</span> {spell.duration}
          {spell.concentration && <span className="ml-1 italic">(концентрация)</span>}
        </div>
      </div>
      
      <Separator className="my-1" />
      
      <div className="text-xs">
        {spell.description.substring(0, 200)}
        {spell.description.length > 200 ? '...' : ''}
      </div>
      
      {spell.higherLevels && (
        <div className="text-xs">
          <span className="font-medium">На более высоком уровне:</span> {spell.higherLevels.substring(0, 100)}
          {spell.higherLevels.length > 100 ? '...' : ''}
        </div>
      )}
      
      <div className="text-xs mt-1">
        <span className="font-medium">Нажмите для полной информации</span>
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="p-2 rounded border flex justify-between items-center hover:bg-background/50 transition-colors cursor-pointer"
          style={{ 
            borderColor: `${currentTheme.accent}30`,
            backgroundColor: `${themeColor || currentTheme.accent}10`
          }}
          onClick={onClick}
        >
          <div className="flex flex-col">
            <span className="font-medium" style={{ color: currentTheme.textColor }}>{spell.name}</span>
            <span className="text-xs" style={{ color: currentTheme.mutedTextColor }}>{spell.school}</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: `${themeColor || currentTheme.accent}30`,
                color: themeColor || currentTheme.accent
              }}
            >
              {getComponentIcons()}{getAdditionalIcons()}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent 
        className="w-72 p-3" 
        sideOffset={10}
        style={{ 
          backgroundColor: currentTheme.cardBackground || "rgba(0, 0, 0, 0.8)", 
          color: currentTheme.textColor,
          borderColor: `${currentTheme.accent}50`
        }}
      >
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
};

export default SpellBookViewer;

