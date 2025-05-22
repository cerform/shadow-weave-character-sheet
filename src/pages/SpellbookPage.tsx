
import React, { useState } from 'react';
import { useSpellbook } from '@/hooks/spellbook/useSpellbook';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import SpellFilterPanel from '@/components/spellbook/SpellFilterPanel';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  
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
    toggleAdvancedFilters
  } = useSpellbook();

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
                      {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || isRitualOnly || isConcentrationOnly) && (
                        <Badge variant="default" className="ml-1">
                          {activeLevel.length + activeSchool.length + activeClass.length + (isRitualOnly ? 1 : 0) + (isConcentrationOnly ? 1 : 0)}
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
                    </div>
                  </SheetContent>
                </Sheet>
                
                {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || isRitualOnly || isConcentrationOnly) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X size={14} />
                    Сбросить
                  </Button>
                )}
              </div>
            </div>
            
            {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || isRitualOnly || isConcentrationOnly) && (
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
              </div>
            )}
          </div>
          
          <SpellBookViewer />
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
