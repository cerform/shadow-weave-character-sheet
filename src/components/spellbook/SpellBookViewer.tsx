
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Book, ArrowLeft, BookOpen } from "lucide-react";
import SpellDetailModal from "@/components/spell-detail/SpellDetailModal";
import NavigationButtons from "@/components/ui/NavigationButtons";
import { ThemeSelector } from "@/components/character-sheet/ThemeSelector"; 
import { useNavigate } from 'react-router-dom';
import { useSpellbook } from '@/hooks/useSpellbook';
import SpellFilters from './SpellFilters';
import SpellList from './SpellList';

const SpellBookViewer: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    selectedSpell,
    isModalOpen,
    activeSchool,
    activeClass,
    currentTheme,
    allLevels,
    allSchools,
    allClasses,
    handleOpenSpell,
    handleClose,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
  } = useSpellbook();

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
      
      <div className="mb-4 flex justify-end">
        <ThemeSelector />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <SpellFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeLevel={activeLevel}
            toggleLevel={toggleLevel}
            activeSchool={activeSchool}
            toggleSchool={toggleSchool}
            activeClass={activeClass}
            toggleClass={toggleClass}
            clearFilters={clearFilters}
            allLevels={allLevels}
            allSchools={allSchools}
            allClasses={allClasses}
            getBadgeColor={getBadgeColor}
            getSchoolBadgeColor={getSchoolBadgeColor}
          />
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
              <SpellList 
                spells={filteredSpells}
                getBadgeColor={getBadgeColor}
                getSchoolBadgeColor={getSchoolBadgeColor}
                currentTheme={currentTheme}
                handleOpenSpell={handleOpenSpell}
                formatClasses={formatClasses}
              />
            </CardContent>
            <CardFooter className="border-t border-border p-4 bg-card/60">
              <div className="text-sm text-muted-foreground">
                Источник: D&D 5e Player's Handbook
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
