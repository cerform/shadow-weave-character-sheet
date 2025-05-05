
import React, { useState, useEffect } from 'react';
import { useSpellbook } from '@/hooks/spellbook/useSpellbook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, BookOpen, Filter, Search, X, ArrowLeft, Info } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import SpellFilters from './SpellFilters';
import SpellCard from './SpellCard';
import SpellTable from './SpellTable';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import { SpellData } from '@/types/spells';
import { convertCharacterSpellsToSpellData } from '@/utils/spellHelpers';
import { getAllSpells } from '@/data/spells';

interface SpellBookViewerProps {
  standalone?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const SpellBookViewer: React.FC<SpellBookViewerProps> = ({
  standalone = true,
  showBackButton = false,
  onBack,
}) => {
  // Используем хук useSpellbook
  const spellbook = useSpellbook();
  const [loading, setLoading] = useState(true);
  const [totalSpellCount, setTotalSpellCount] = useState(0);
  
  // Извлекаем свойства и методы из spellbook
  const { 
    filteredSpells, 
    searchTerm, 
    setSearchTerm, 
    activeLevel, 
    activeSchool, 
    activeClass, 
    currentTheme, 
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
  } = spellbook;

  const [viewMode, setViewMode] = useState('cards');

  // Преобразуем все заклинания в формат SpellData с обязательными полями
  const spellsData: SpellData[] = convertCharacterSpellsToSpellData(filteredSpells);

  // Получаем общее количество заклинаний при загрузке компонента
  useEffect(() => {
    const allSpells = getAllSpells();
    setTotalSpellCount(allSpells.length);
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button variant="outline" size="sm" onClick={onBack} 
              style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
          )}
          <h1 className="text-3xl font-bold" style={{ 
            color: currentTheme.accent, 
            textShadow: `0 0 10px ${currentTheme.accent}50` 
          }}>
            Книга заклинаний
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSelector />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" style={{ 
                borderColor: currentTheme.accent, 
                color: currentTheme.textColor 
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]" style={{
              backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)',
              borderColor: currentTheme.accent
            }}>
              <SpellFilters 
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
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentTheme={currentTheme}
              />
            </SheetContent>
          </Sheet>
          
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            style={{ 
              backgroundColor: viewMode === 'cards' ? currentTheme.accent : 'transparent',
              borderColor: currentTheme.accent,
              color: viewMode === 'cards' ? '#fff' : currentTheme.textColor
            }}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            style={{ 
              backgroundColor: viewMode === 'table' ? currentTheme.accent : 'transparent',
              borderColor: currentTheme.accent,
              color: viewMode === 'table' ? '#fff' : currentTheme.textColor
            }}
          >
            <Book className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.textColor,
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <Card style={{ 
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)',
          borderColor: currentTheme.accent,
          boxShadow: `0 0 10px ${currentTheme.accent}30`
        }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {activeLevel.map((level: number) => (
                <Button
                  key={`level-${level}`}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLevel(level)}
                  className="flex items-center gap-1"
                  style={{ 
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor,
                    backgroundColor: `${currentTheme.accent}20`
                  }}
                >
                  {level === 0 ? 'Заговор' : `Уровень ${level}`}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              
              {activeSchool.map((school: string) => (
                <Button
                  key={`school-${school}`}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSchool(school)}
                  className="flex items-center gap-1"
                  style={{ 
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor,
                    backgroundColor: `${currentTheme.accent}20`
                  }}
                >
                  {school}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              
              {activeClass.map((cls: string) => (
                <Button
                  key={`class-${cls}`}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleClass(cls)}
                  className="flex items-center gap-1"
                  style={{ 
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor,
                    backgroundColor: `${currentTheme.accent}20`
                  }}
                >
                  {cls}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              
              {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearFilters}
                  style={{
                    backgroundColor: currentTheme.accent
                  }}
                >
                  Очистить фильтры
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-4 py-2 text-sm flex justify-between">
            <div style={{ color: currentTheme.textColor }}>
              Найдено заклинаний: {spellsData.length}
            </div>
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Info className="h-4 w-4 mr-1" />
              <span>Всего заклинаний в базе: {totalSpellCount}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {loading ? (
        <div className="text-center py-10" style={{ color: currentTheme.textColor }}>
          <div className="inline-block animate-spin h-8 w-8 border-4 border-t-transparent border-accent rounded-full mb-2"></div>
          <p>Загрузка заклинаний...</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spellsData.map((spell, index) => (
            <SpellCard
              key={spell.id?.toString() || `spell-${index}`}
              spell={spell}
              onClick={() => handleOpenSpell(spell)}
              currentTheme={currentTheme}
            />
          ))}
          
          {spellsData.length === 0 && (
            <div className="col-span-full text-center py-10" style={{ color: currentTheme.textColor }}>
              <p className="text-lg">Заклинания не найдены</p>
              <p className="text-sm mt-2">Попробуйте изменить параметры поиска или фильтрации</p>
            </div>
          )}
        </div>
      ) : (
        <SpellTable 
          spells={spellsData}
          onSpellClick={handleOpenSpell}
          currentTheme={currentTheme}
        />
      )}
      
      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          open={isModalOpen}
          onClose={handleClose}
          currentTheme={currentTheme}
        />
      )}
      
      {standalone && (
        <div className="mt-8">
          <NavigationButtons />
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
