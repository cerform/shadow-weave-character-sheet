
import React, { useState } from 'react';
import { useSpellbook } from '@/hooks/spellbook';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import SpellFilterPanel from '@/components/spellbook/SpellFilterPanel';
import AdvancedFilters from '@/components/spellbook/AdvancedFilters';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [filterTab, setFilterTab] = useState("basic");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const {
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
    getBadgeColor,
    getSchoolBadgeColor,
    isRitualOnly,
    isConcentrationOnly,
    toggleRitualOnly,
    toggleConcentrationOnly,
    advancedFiltersOpen,
    toggleAdvancedFilters,
    
    // Расширенные фильтры
    verbalComponent,
    setVerbalComponent,
    somaticComponent,
    setSomaticComponent,
    materialComponent,
    setMaterialComponent,
    castingTimes,
    activeCastingTimes,
    toggleCastingTime,
    rangeTypes,
    activeRangeTypes,
    toggleRangeType,
    durationTypes,
    activeDurationTypes,
    toggleDurationType,
    sources,
    activeSources,
    toggleSource,
    clearAdvancedFilters
  } = useSpellbook();

  // Получение общего количества активных фильтров
  const getTotalActiveFilters = () => {
    let count = 0;
    count += activeLevel.length;
    count += activeSchool.length;
    count += activeClass.length;
    if (isRitualOnly) count++;
    if (isConcentrationOnly) count++;
    
    // Расширенные фильтры
    if (verbalComponent !== null) count++;
    if (somaticComponent !== null) count++;
    if (materialComponent !== null) count++;
    count += activeCastingTimes.length;
    count += activeRangeTypes.length;
    count += activeDurationTypes.length;
    count += activeSources.length;
    
    return count;
  };
  
  // Получение количества активных расширенных фильтров
  const getAdvancedFiltersCount = () => {
    let count = 0;
    if (verbalComponent !== null) count++;
    if (somaticComponent !== null) count++;
    if (materialComponent !== null) count++;
    count += activeCastingTimes.length;
    count += activeRangeTypes.length;
    count += activeDurationTypes.length;
    count += activeSources.length;
    return count;
  };

  const totalFiltersCount = getTotalActiveFilters();
  const advancedFiltersCount = getAdvancedFiltersCount();

  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0" style={{ color: themeStyles?.textColor }}>
              Книга заклинаний D&D 5e
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10 pr-4 w-full"
                  placeholder="Поиск заклинаний..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <SlidersHorizontal size={16} />
                      <span>Фильтры</span>
                      {totalFiltersCount > 0 && (
                        <Badge variant="default" className="ml-1">
                          {totalFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Фильтры заклинаний</SheetTitle>
                      <SheetDescription>
                        Настройте параметры фильтрации заклинаний
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <Tabs defaultValue="basic" value={filterTab} onValueChange={setFilterTab}>
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="basic">
                            Основные
                            {(activeLevel.length + activeSchool.length + activeClass.length + (isRitualOnly ? 1 : 0) + (isConcentrationOnly ? 1 : 0)) > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {activeLevel.length + activeSchool.length + activeClass.length + (isRitualOnly ? 1 : 0) + (isConcentrationOnly ? 1 : 0)}
                              </Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="advanced">
                            Расширенные
                            {advancedFiltersCount > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {advancedFiltersCount}
                              </Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic">
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
                            isRitualOnly={isRitualOnly}
                            isConcentrationOnly={isConcentrationOnly}
                            toggleRitualOnly={toggleRitualOnly}
                            toggleConcentrationOnly={toggleConcentrationOnly}
                            advancedFiltersOpen={advancedFiltersOpen}
                            toggleAdvancedFilters={toggleAdvancedFilters}
                          />
                        </TabsContent>
                        
                        <TabsContent value="advanced">
                          <AdvancedFilters
                            verbalComponent={verbalComponent}
                            somaticComponent={somaticComponent}
                            materialComponent={materialComponent}
                            setVerbalComponent={setVerbalComponent}
                            setSomaticComponent={setSomaticComponent}
                            setMaterialComponent={setMaterialComponent}
                            castingTimes={castingTimes}
                            activeCastingTimes={activeCastingTimes}
                            toggleCastingTime={toggleCastingTime}
                            rangeTypes={rangeTypes}
                            activeRangeTypes={activeRangeTypes}
                            toggleRangeType={toggleRangeType}
                            durationTypes={durationTypes}
                            activeDurationTypes={activeDurationTypes}
                            toggleDurationType={toggleDurationType}
                            sources={sources}
                            activeSources={activeSources}
                            toggleSource={toggleSource}
                            clearAdvancedFilters={clearAdvancedFilters}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </SheetContent>
                </Sheet>
                
                {(totalFiltersCount > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X size={14} />
                    Сбросить
                  </Button>
                )}
              </div>
            </div>
            
            {(totalFiltersCount > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeLevel.map(level => (
                  <Badge
                    key={`active-level-${level}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{
                      backgroundColor: getBadgeColor(level),
                      color: '#fff'
                    }}
                  >
                    {level === 0 ? 'Заговор' : `Уровень ${level}`}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => toggleLevel(level)}
                    />
                  </Badge>
                ))}
                
                {activeSchool.map(school => (
                  <Badge
                    key={`active-school-${school}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{
                      backgroundColor: getSchoolBadgeColor(school),
                      color: '#fff'
                    }}
                  >
                    {school}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => toggleSchool(school)}
                    />
                  </Badge>
                ))}
                
                {activeClass.map(cls => (
                  <Badge
                    key={`active-class-${cls}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {cls}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => toggleClass(cls)}
                    />
                  </Badge>
                ))}
                
                {isRitualOnly && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-purple-400 text-purple-400"
                  >
                    Ритуал
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={toggleRitualOnly}
                    />
                  </Badge>
                )}
                
                {isConcentrationOnly && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-blue-400 text-blue-400"
                  >
                    Концентрация
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={toggleConcentrationOnly}
                    />
                  </Badge>
                )}
                
                {verbalComponent !== null && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-green-400 text-green-400"
                  >
                    Вербальный (В)
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setVerbalComponent(null)}
                    />
                  </Badge>
                )}
                
                {somaticComponent !== null && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-yellow-400 text-yellow-400"
                  >
                    Соматический (С)
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setSomaticComponent(null)}
                    />
                  </Badge>
                )}
                
                {materialComponent !== null && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-orange-400 text-orange-400"
                  >
                    Материальный (М)
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setMaterialComponent(null)}
                    />
                  </Badge>
                )}
                
                {activeCastingTimes.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-indigo-400 text-indigo-400"
                  >
                    Время накладывания: {activeCastingTimes.length}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setActiveCastingTimes([])}
                    />
                  </Badge>
                )}
                
                {activeRangeTypes.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-pink-400 text-pink-400"
                  >
                    Дистанция: {activeRangeTypes.length}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setActiveRangeTypes([])}
                    />
                  </Badge>
                )}
                
                {activeDurationTypes.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-teal-400 text-teal-400"
                  >
                    Длительность: {activeDurationTypes.length}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setActiveDurationTypes([])}
                    />
                  </Badge>
                )}
                
                {activeSources.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-gray-400 text-gray-400"
                  >
                    Источник: {activeSources.length}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => setActiveSources([])}
                    />
                  </Badge>
                )}
              </div>
            )}
            
            {/* Индикатор количества заклинаний после фильтрации */}
            <Collapsible
              open={advancedFiltersCount > 0}
              className="mb-2"
            >
              <CollapsibleContent className="text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Filter size={14} className="mr-1" />
                  Дополнительные фильтры: {advancedFiltersCount}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <SpellBookViewer />
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
