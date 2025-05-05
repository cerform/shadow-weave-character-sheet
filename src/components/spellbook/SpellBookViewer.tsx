
import React, { useState, useEffect } from 'react';
import { useSpellbook } from '@/hooks/spellbook/useSpellbook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Book, 
  BookOpen, 
  Filter, 
  Search, 
  X, 
  ArrowLeft, 
  Info,
  List, 
  Grid, 
  Bookmark, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import SpellFilters from './SpellFilters';
import SpellCard from './SpellCard';
import SpellTable from './SpellTable';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // для режима карточек
  
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
    handleClose
  } = spellbook;

  const [viewMode, setViewMode] = useState('cards');

  // Преобразуем все заклинания в формат SpellData с обязательными полями
  const spellsData: SpellData[] = filteredSpells as unknown as SpellData[];

  // Получаем общее количество заклинаний при загрузке компонента
  useEffect(() => {
    const allSpells = getAllSpells();
    setTotalSpellCount(allSpells.length);
    setLoading(false);
  }, []);

  // Пагинация для режима карточек
  const totalPages = Math.ceil(spellsData.length / itemsPerPage);
  const currentPageItems = viewMode === 'cards' 
    ? spellsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : spellsData;
    
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [activeLevel, activeSchool, activeClass, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button variant="outline" size="sm" onClick={onBack} 
              style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
          )}
          <h1 className="text-3xl font-bold flex items-center" style={{ 
            color: currentTheme.textColor,
            textShadow: `0 0 10px ${currentTheme.accent}50` 
          }}>
            <BookOpen className="h-7 w-7 mr-3" style={{ color: currentTheme.accent }} />
            Книга заклинаний
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSelector />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" style={{ 
                borderColor: currentTheme.accent, 
                color: currentTheme.textColor,
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px]" style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              borderColor: currentTheme.accent,
              boxShadow: `0 0 15px ${currentTheme.accent}30`
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
          
          <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${currentTheme.accent}` }}>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('cards')}
              style={{ 
                backgroundColor: viewMode === 'cards' ? currentTheme.accent : 'rgba(0, 0, 0, 0.3)',
                borderColor: 'transparent',
                color: viewMode === 'cards' ? '#fff' : currentTheme.textColor
              }}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('table')}
              style={{ 
                backgroundColor: viewMode === 'table' ? currentTheme.accent : 'rgba(0, 0, 0, 0.3)',
                borderColor: 'transparent',
                color: viewMode === 'table' ? '#fff' : currentTheme.textColor
              }}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: currentTheme.accent }} />
          <Input
            placeholder="Поиск заклинаний по названию, описанию или ключевым словам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-12 text-lg transition-all duration-200 focus-visible:ring-offset-0 focus-visible:ring-2"
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.textColor,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              boxShadow: searchTerm ? `0 0 10px ${currentTheme.accent}30` : 'none',
              borderWidth: searchTerm ? '2px' : '1px'
            }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              className="absolute right-1 top-1 h-10 w-10 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-5 w-5" style={{ color: currentTheme.accent }} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <Card style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
                  className="flex items-center gap-1 animate-fade-in"
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
                  className="flex items-center gap-1 animate-fade-in"
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
                  className="flex items-center gap-1 animate-fade-in"
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
                  className="animate-fade-in"
                  style={{
                    backgroundColor: currentTheme.accent,
                    color: '#fff'
                  }}
                >
                  Очистить фильтры
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-4 py-2 text-sm flex justify-between border-t" 
            style={{ borderColor: currentTheme.accent + '30' }}
          >
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Bookmark className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
              <span>Найдено заклинаний: {spellsData.length}</span>
            </div>
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Info className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
              <span>Всего в базе: {totalSpellCount}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {loading ? (
        <div className="text-center py-10" style={{ color: currentTheme.textColor }}>
          <div className="inline-block animate-spin h-8 w-8 border-4 border-t-transparent rounded-full mb-2"
            style={{ borderColor: `${currentTheme.accent}80`, borderTopColor: 'transparent' }}
          ></div>
          <p>Загрузка заклинаний...</p>
        </div>
      ) : viewMode === 'cards' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentPageItems.map((spell, index) => (
              <SpellCard
                key={spell.id?.toString() || `spell-${index}`}
                spell={spell}
                onClick={() => handleOpenSpell(spell)}
                currentTheme={currentTheme}
              />
            ))}
            
            {spellsData.length === 0 && (
              <div className="col-span-full text-center py-10" style={{ color: currentTheme.textColor }}>
                <div className="flex flex-col items-center">
                  <Book className="h-16 w-16 mb-4 opacity-30" style={{ color: currentTheme.accent }} />
                  <p className="text-lg font-semibold mb-2">Заклинания не найдены</p>
                  <p className="text-sm opacity-70">Попробуйте изменить параметры поиска или фильтрации</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Пагинация */}
          {spellsData.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                style={{ 
                  borderColor: currentPage === 1 ? 'transparent' : currentTheme.accent,
                  color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : currentTheme.textColor,
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div style={{ color: currentTheme.textColor }}>
                Страница {currentPage} из {totalPages}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                style={{ 
                  borderColor: currentPage === totalPages ? 'transparent' : currentTheme.accent,
                  color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : currentTheme.textColor,
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', padding: '0.5rem' }}>
          <SpellTable 
            spells={spellsData}
            onSpellClick={handleOpenSpell}
            currentTheme={currentTheme}
          />
        </div>
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
