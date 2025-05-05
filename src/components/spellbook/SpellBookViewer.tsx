
import React, { useState } from 'react';
import { useSpellbook } from '@/hooks/spellbook/useSpellbook';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Book, BookOpen, Filter, Search, X, ArrowLeft } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import SpellFilters from './SpellFilters';
import SpellCard from './SpellCard';
import SpellTable from './SpellTable';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import { SpellData } from '@/types/spells';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
          )}
          <h1 className="text-3xl font-bold">Книга заклинаний</h1>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSelector />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
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
              />
            </SheetContent>
          </Sheet>
          
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
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
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {activeLevel.map((level: number) => (
                <Button
                  key={`level-${level}`}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLevel(level)}
                  className="flex items-center gap-1"
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
                >
                  Очистить фильтры
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-4 py-2 text-sm text-muted-foreground">
            Найдено заклинаний: {filteredSpells.length}
          </CardFooter>
        </Card>
      </div>
      
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpells.map((spell) => (
            <SpellCard
              key={spell.name}
              spell={spell as SpellData}
              onClick={() => handleOpenSpell(spell as SpellData)}
            />
          ))}
        </div>
      ) : (
        <SpellTable 
          spells={filteredSpells as SpellData[]}
          onSpellClick={handleOpenSpell}
        />
      )}
      
      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          open={isModalOpen}
          onClose={handleClose}
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
