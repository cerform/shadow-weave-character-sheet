
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, X } from "lucide-react";
import SpellList from './SpellList';
import SpellTable from './SpellTable';
import SpellDetailModal from './SpellDetailModal';
import SpellFilterPanel from './SpellFilterPanel';
import { useSpellbook } from '@/hooks/spellbook';
import { useTheme } from '@/hooks/use-theme';
import { Skeleton } from '@/components/ui/skeleton';

const SpellBookViewer: React.FC = () => {
  const {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    allLevels,
    allSchools,
    allClasses,
    activeLevel,
    activeSchool,
    activeClass,
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
    formatClasses,
    loading
  } = useSpellbook();

  const [viewMode, setViewMode] = useState<string>('list');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { theme, themeStyles } = useTheme();

  // Это нужно для обновления UI при изменении searchTerm
  const [searchValue, setSearchValue] = useState<string>(searchTerm);
  
  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setSearchTerm(newValue);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchValue('');
  };

  const currentTheme = themeStyles || {
    backgroundColor: '#0f1729', // Темно-синий фон
    cardBackground: 'rgba(0, 0, 0, 0.75)',
    textColor: '#ffffff',
    accent: '#3b82f6' // Синий акцент
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full sm:w-auto">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 pr-10 bg-black/20 border-accent/30"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-accent" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFilters}
            className={`${
              showFilters ? 'bg-accent text-white' : 'bg-black/20'
            } border-accent/30`}
          >
            <FilterIcon className="mr-1 h-4 w-4" />
            Фильтры
            {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-accent/30 rounded-full">
                {activeLevel.length + activeSchool.length + activeClass.length}
              </span>
            )}
          </Button>

          <Tabs 
            defaultValue="list" 
            value={viewMode} 
            onValueChange={setViewMode} 
            className="hidden sm:flex"
          >
            <TabsList className="bg-black/20 border border-accent/30">
              <TabsTrigger value="list">Список</TabsTrigger>
              <TabsTrigger value="table">Таблица</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showFilters && (
        <SpellFilterPanel
          allLevels={allLevels}
          allSchools={allSchools}
          allClasses={allClasses}
          activeLevel={activeLevel}
          activeSchool={activeSchool}
          activeClass={activeClass}
          toggleLevel={toggleLevel}
          toggleSchool={toggleSchool}
          toggleClass={toggleClass}
          clearFilters={clearFilters}
          currentTheme={currentTheme}
        />
      )}

      {loading ? (
        <div className="space-y-4 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Найдено заклинаний: <span className="font-semibold">{filteredSpells.length}</span>
          </div>

          <TabsContent value="list" className={viewMode === 'list' ? 'block' : 'hidden'}>
            <SpellList
              spells={filteredSpells}
              getBadgeColor={getBadgeColor}
              getSchoolBadgeColor={getSchoolBadgeColor}
              currentTheme={currentTheme}
              handleOpenSpell={handleOpenSpell}
              formatClasses={formatClasses}
            />
          </TabsContent>

          <TabsContent value="table" className={viewMode === 'table' ? 'block' : 'hidden'}>
            <SpellTable
              spells={filteredSpells}
              onSpellClick={handleOpenSpell}
              currentTheme={currentTheme}
            />
          </TabsContent>

          <div className="sm:hidden mt-6">
            <Tabs defaultValue="list" value={viewMode} onValueChange={setViewMode}>
              <TabsList className="w-full bg-black/20 border border-accent/30">
                <TabsTrigger value="list" className="flex-1">
                  Список
                </TabsTrigger>
                <TabsTrigger value="table" className="flex-1">
                  Таблица
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {selectedSpell && (
            <SpellDetailModal
              spell={selectedSpell}
              open={isModalOpen}
              onClose={handleClose}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SpellBookViewer;
