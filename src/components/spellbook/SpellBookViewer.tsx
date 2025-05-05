
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
  
  // Theme handling
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Extract all available filter options
  const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const allSchools = Array.from(new Set(filteredSpells.map(spell => spell.school || ''))).filter(Boolean).sort();
  const allClasses = extractClasses();

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
          />
        </div>
        
        {/* Spells List Column */}
        <div className="md:col-span-3">
          <SpellList 
            spells={filteredSpells}
            getBadgeColor={getBadgeColor}
            getSchoolBadgeColor={getSchoolBadgeColor}
            currentTheme={currentTheme}
            handleOpenSpell={handleOpenSpell}
            formatClasses={formatClasses}
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
      
      {/* Pagination Button Example (if needed) */}
      {filteredSpells.length > 20 && (
        <div className="flex justify-center mt-6 gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Предыдущая
          </Button>
          <Button variant="outline" size="sm">
            Следующая <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
