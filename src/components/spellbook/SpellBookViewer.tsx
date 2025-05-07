
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Filter, Plus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { spells as allSpells } from '@/data/spells';
import SpellDetailView from './SpellDetailView';
import SpellFilterPanel from './SpellFilterPanel';
import SpellImportModal from './SpellImportModal';
import { useSpellbook } from '@/hooks/spellbook/useSpellbook';
import { SpellData } from '@/types/spells';
import { convertCharacterSpellsToSpellData } from '@/utils/spellHelpers';

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    allLevels,
    allSchools,
    allClasses,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    selectedSpell,
    isModalOpen,
    handleOpenSpell,
    handleClose,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses
  } = useSpellbook();

  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Преобразуем CharacterSpell[] в SpellData[]
  const spellsData: SpellData[] = convertCharacterSpellsToSpellData(filteredSpells);

  // Группировка заклинаний по уровням для отображения на вкладках
  const spellsByLevel = allLevels.reduce((acc, level) => {
    acc[level] = spellsData.filter(spell => spell.level === level);
    return acc;
  }, {} as Record<number, SpellData[]>);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 
          className="text-3xl font-bold spellbook-heading"
          style={{ color: currentTheme.textColor }}
        >
          Книга заклинаний
        </h1>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск заклинаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 h-9 w-[200px] md:w-[250px]"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setShowImport(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Импорт
          </Button>
        </div>
      </div>

      {showFilters && (
        <SpellFilterPanel
          activeLevel={activeLevel}
          activeSchool={activeSchool}
          activeClass={activeClass}
          allLevels={allLevels}
          allSchools={allSchools}
          allClasses={allClasses}
          toggleLevel={toggleLevel}
          toggleSchool={toggleSchool}
          toggleClass={toggleClass}
          clearFilters={clearFilters}
          getBadgeColor={getBadgeColor}
          getSchoolBadgeColor={getSchoolBadgeColor}
        />
      )}

      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="bg-card/50 p-1 w-full max-w-full flex overflow-x-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
          <TabsTrigger value="all" className="flex-shrink-0">Все</TabsTrigger>
          {allLevels.map(level => (
            <TabsTrigger 
              key={`tab-${level}`} 
              value={`level-${level}`}
              className="flex-shrink-0"
            >
              {level === 0 ? 'Заговоры' : `${level} уровень`}
              {activeLevel.includes(level) && (
                <Badge variant="outline" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  ✓
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4 animate-in fade-in-50">
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle 
                style={{ color: currentTheme.textColor }}
                className="flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-2" /> 
                Все заклинания
                {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
                  <Badge variant="outline" className="ml-2">
                    Активны фильтры
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spellsData.length > 0 ? (
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spellsData.map(spell => (
                      <Card 
                        key={spell.name} 
                        className="spell-card hover:bg-accent/10 transition-all cursor-pointer"
                        onClick={() => handleOpenSpell(spell)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg" style={{ color: currentTheme.textColor }}>
                                {spell.name}
                              </h3>
                              <Badge 
                                style={{ 
                                  backgroundColor: getBadgeColor(spell.level)
                                }}
                                className="text-white ml-2"
                              >
                                {spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                style={{ 
                                  borderColor: getSchoolBadgeColor(spell.school),
                                  color: getSchoolBadgeColor(spell.school)
                                }}
                              >
                                {spell.school}
                              </Badge>
                              
                              {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
                              {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
                            </div>
                            
                            <div className="mt-3 text-sm text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Время накл.:</span>
                                <span>{spell.castingTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Дистанция:</span>
                                <span>{spell.range}</span>
                              </div>
                              {spell.classes && (
                                <div className="mt-2 text-xs">
                                  <span className="text-muted-foreground">Классы: </span>
                                  <span>{formatClasses(spell.classes)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Нет заклинаний</h3>
                  <p>Не найдено заклинаний по указанным фильтрам</p>
                  {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || searchTerm) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={clearFilters}
                    >
                      Сбросить фильтры
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {allLevels.map(level => (
          <TabsContent key={`content-${level}`} value={`level-${level}`} className="mt-4 animate-in fade-in-50">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.textColor }}>
                  {level === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {spellsByLevel[level]?.length > 0 ? (
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {spellsByLevel[level].map(spell => (
                        <Card 
                          key={spell.name} 
                          className="spell-card hover:bg-accent/10 transition-all cursor-pointer"
                          onClick={() => handleOpenSpell(spell)}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg" style={{ color: currentTheme.textColor }}>
                                  {spell.name}
                                </h3>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  style={{ 
                                    borderColor: getSchoolBadgeColor(spell.school),
                                    color: getSchoolBadgeColor(spell.school)
                                  }}
                                >
                                  {spell.school}
                                </Badge>
                                
                                {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
                                {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
                              </div>
                              
                              <div className="mt-3 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Время накл.:</span>
                                  <span>{spell.castingTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Дистанция:</span>
                                  <span>{spell.range}</span>
                                </div>
                                {spell.classes && (
                                  <div className="mt-2 text-xs">
                                    <span className="text-muted-foreground">Классы: </span>
                                    <span>{formatClasses(spell.classes)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">Нет заклинаний</h3>
                    <p>Не найдено заклинаний для этого уровня</p>
                    {(activeSchool.length > 0 || activeClass.length > 0 || searchTerm) && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={clearFilters}
                      >
                        Сбросить фильтры
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Модальное окно с детальной информацией о заклинании */}
      <SpellDetailView 
        spell={selectedSpell} 
        isOpen={isModalOpen} 
        onClose={handleClose} 
      />

      {/* Модальное окно для импорта заклинаний */}
      <SpellImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />
    </div>
  );
};

export default SpellBookViewer;
