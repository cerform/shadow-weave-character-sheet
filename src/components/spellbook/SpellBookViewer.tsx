
import React, { useState, useEffect } from 'react';
import { useSpellbook } from '@/hooks/spellbook';
import { Card } from '@/components/ui/card';
import SpellFilters from './SpellFilters';
import SpellList from './SpellList';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import { SpellData } from '@/hooks/spellbook/types';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useUserTheme } from '@/hooks/use-user-theme';
import HomeButton from '../navigation/HomeButton';
import MainNavigation from '../navigation/MainNavigation';
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft, Book } from 'lucide-react';

const SpellBookViewer = () => {
  const { 
    filteredSpells,
    allSpells,
    searchTerm, 
    setSearchTerm,
    levelFilters,
    schoolFilters,
    classFilters,
    toggleFilter,
    getSchoolBadgeColor,
    getBadgeColor,
    formatClasses,
    extractClasses
  } = useSpellbook();
  
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const spellsPerPage = 20;
  
  // Theme handling
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Extract all available filter options
  const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const allSchools = Array.from(new Set(filteredSpells.map(spell => spell.school || ''))).filter(Boolean).sort();
  const allClasses = extractClasses();

  // Пагинация
  const totalPages = Math.ceil(filteredSpells.length / spellsPerPage);
  const indexOfLastSpell = currentPage * spellsPerPage;
  const indexOfFirstSpell = indexOfLastSpell - spellsPerPage;
  const currentSpells = filteredSpells.slice(indexOfFirstSpell, indexOfLastSpell);
  
  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilters, schoolFilters, classFilters]);

  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    levelFilters.forEach(level => toggleFilter('level', level));
    schoolFilters.forEach(school => toggleFilter('school', school));
    classFilters.forEach(className => toggleFilter('class', className));
  };

  return (
    <div 
      className="container mx-auto py-4 min-h-screen"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor
      }}
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 p-2">
        <div className="flex items-center">
          <HomeButton className="mr-2" showText={false} />
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <Book className="mr-2 h-6 w-6" style={{color: currentTheme.accent}} />
            Книга заклинаний
          </h1>
        </div>
        <div>
          <MainNavigation />
        </div>
      </div>

      {/* Статистика заклинаний */}
      <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-semibold">Показано:</span> {currentSpells.length} из {filteredSpells.length} заклинаний
            {filteredSpells.length !== allSpells.length && (
              <span> (всего в базе: {allSpells.length})</span>
            )}
          </div>
          <div>
            {filteredSpells.length > spellsPerPage && (
              <div className="text-sm">
                Страница {currentPage} из {totalPages}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Column */}
        <div className="md:col-span-1">
          <SpellFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeLevel={levelFilters}
            toggleLevel={(level) => toggleFilter('level', level)}
            activeSchool={schoolFilters}
            toggleSchool={(school) => toggleFilter('school', school)}
            activeClass={classFilters}
            toggleClass={(className) => toggleFilter('class', className)}
            clearFilters={clearFilters}
            allLevels={allLevels}
            allSchools={allSchools}
            allClasses={allClasses}
            getBadgeColor={getBadgeColor}
            getSchoolBadgeColor={getSchoolBadgeColor}
            totalFound={filteredSpells.length}
            totalSpells={allSpells.length}
          />
        </div>
        
        {/* Spells List Column */}
        <div className="md:col-span-3">
          <SpellList 
            spells={currentSpells}
            getBadgeColor={getBadgeColor}
            getSchoolBadgeColor={getSchoolBadgeColor}
            currentTheme={currentTheme}
            handleOpenSpell={handleOpenSpell}
            formatClasses={formatClasses}
            totalShown={`${indexOfFirstSpell + 1}-${Math.min(indexOfLastSpell, filteredSpells.length)} из ${filteredSpells.length}`}
          />
        </div>
      </div>

      {/* Modal for spell details */}
      {selectedSpell && (
        <SpellDetailModal 
          spell={selectedSpell}
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
        />
      )}
      
      {/* Pagination Buttons */}
      {filteredSpells.length > spellsPerPage && (
        <div className="flex justify-center mt-6 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="transition-all"
            style={{ 
              borderColor: `${currentTheme.accent}80`,
              boxShadow: 'none'
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Предыдущая
          </Button>
          
          {totalPages <= 7 ? (
            // Если страниц немного, показываем все номера
            [...Array(totalPages)].map((_, idx) => (
              <Button 
                key={idx} 
                variant={currentPage === idx + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  backgroundColor: currentPage === idx + 1 ? currentTheme.accent : undefined,
                  borderColor: `${currentTheme.accent}80`,
                  boxShadow: currentPage === idx + 1 ? `0 0 8px ${currentTheme.accent}60` : 'none'
                }}
              >
                {idx + 1}
              </Button>
            ))
          ) : (
            // Если страниц много, показываем сокращенную навигацию
            <>
              {currentPage > 2 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(1)}
                  style={{ borderColor: `${currentTheme.accent}80`, boxShadow: 'none' }}
                >
                  1
                </Button>
              )}
              
              {currentPage > 3 && <span className="self-center mx-1">...</span>}
              
              {currentPage > 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={{ borderColor: `${currentTheme.accent}80`, boxShadow: 'none' }}
                >
                  {currentPage - 1}
                </Button>
              )}
              
              <Button 
                variant="default" 
                size="sm"
                style={{
                  backgroundColor: currentTheme.accent,
                  boxShadow: `0 0 8px ${currentTheme.accent}60`
                }}
              >
                {currentPage}
              </Button>
              
              {currentPage < totalPages && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{ borderColor: `${currentTheme.accent}80`, boxShadow: 'none' }}
                >
                  {currentPage + 1}
                </Button>
              )}
              
              {currentPage < totalPages - 2 && <span className="self-center mx-1">...</span>}
              
              {currentPage < totalPages - 1 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(totalPages)}
                  style={{ borderColor: `${currentTheme.accent}80`, boxShadow: 'none' }}
                >
                  {totalPages}
                </Button>
              )}
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="transition-all"
            style={{ 
              borderColor: `${currentTheme.accent}80`,
              boxShadow: 'none'
            }}
          >
            Следующая <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
