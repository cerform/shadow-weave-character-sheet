
import React, { useState } from 'react';
import { useSpellbook } from '@/hooks/spellbook';
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData, convertSpellDataToCharacterSpell } from '@/types/spells';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Book, BookOpen, Filter, Search, X, ArrowLeft } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import SpellFilters from './SpellFilters';
import SpellList from './SpellList';
import SpellDetailModal from '../spell-detail/SpellDetailModal';

const SpellBookViewer: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [spellsData, setSpellsData] = useState<SpellData[]>([]);
  // Для имитации useNavigate и useIsMobile hooks
  const navigate = (path: string | number) => {
    console.log('Navigate to:', path);
  };
  const isMobile = window.innerWidth < 768;

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

  // Оборачиваем функции для сохранения состояния открытия sheet при выборе фильтров
  const handleToggleLevel = (level: number) => {
    toggleLevel(level);
    // Удаляем автоматическое закрытие
  };
  
  const handleToggleSchool = (school: string) => {
    toggleSchool(school);
    // Удаляем автоматическое закрытие
  };
  
  const handleToggleClass = (className: string) => {
    toggleClass(className);
    // Удаляем автоматическое закрытие
  };
  
  const handleClearFilters = () => {
    clearFilters();
    // Удаляем автоматическое закрытие
  };

  // Навигационные кнопки для мобильной версии
  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-accent z-30 flex justify-around p-2">
      <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
        <Home className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => navigate('/handbook')}>
        <BookOpen className="h-5 w-5" />
      </Button>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85%] sm:w-[385px] pt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Фильтры заклинаний</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          <div className="h-[calc(100vh-100px)] overflow-auto pb-16">
            <SpellFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeLevel={activeLevel}
              toggleLevel={handleToggleLevel}
              activeSchool={activeSchool}
              toggleSchool={handleToggleSchool}
              activeClass={activeClass}
              toggleClass={handleToggleClass}
              clearFilters={handleClearFilters}
              allLevels={allLevels}
              allSchools={allSchools}
              allClasses={allClasses}
              getBadgeColor={getBadgeColor}
              getSchoolBadgeColor={getSchoolBadgeColor}
            />
          </div>
        </SheetContent>
      </Sheet>
      <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(true)}>
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );

  // Содержимое для мобильных фильтров
  const MobileFilters = () => (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent side="right" className="w-[85%] sm:w-[385px] pt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Поиск заклинаний</h2>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>
        <div className="h-[calc(100vh-100px)] overflow-auto pb-16">
          <SpellFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeLevel={activeLevel}
            toggleLevel={handleToggleLevel}
            activeSchool={activeSchool}
            toggleSchool={handleToggleSchool}
            activeClass={activeClass}
            toggleClass={handleToggleClass}
            clearFilters={handleClearFilters}
            allLevels={allLevels}
            allSchools={allSchools}
            allClasses={allClasses}
            getBadgeColor={getBadgeColor}
            getSchoolBadgeColor={getSchoolBadgeColor}
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  // Функция для конвертации CharacterSpell в SpellData
  const convertToSpellData = (spell: CharacterSpell): SpellData => {
    return {
      id: spell.id?.toString() || Math.random().toString(),
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Неизвестная', // Добавляем значение по умолчанию
      castingTime: spell.castingTime || "1 действие",
      range: spell.range || "Касание",
      components: spell.components || "В, С",
      duration: spell.duration || "Мгновенная",
      description: spell.description || "",
      higherLevels: spell.higherLevels || "",
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      classes: Array.isArray(spell.classes) ? spell.classes : 
               (spell.classes ? [spell.classes] : [])
    };
  };

  // Обновляем метод, который использует CharacterSpell[]
  const handleImportSpells = (spells: CharacterSpell[]) => {
    // Конвертируем CharacterSpell[] в SpellData[]
    const convertedSpells = spells.map(convertToSpellData);
    setSpellsData(convertedSpells);
  };

  // Обработчик добавления заклинания
  const handleAddSpell = (spell: CharacterSpell | SpellData) => {
    // Реализация пустая для примера
    console.log('Adding spell:', spell.name);
  };

  // Обработчик сохранения заклинаний
  const handleSaveSpells = (spells: CharacterSpell[]) => {
    // Конвертируем CharacterSpell[] в SpellData[] перед сохранением
    const convertedSpells: SpellData[] = spells.map(spell => convertCharacterSpellToSpellData(spell));
    setSpellsData(convertedSpells);
  };

  return (
    <div className="container mx-auto px-4 py-6">
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
            {isMobile ? "Книга заклинаний" : "Книга заклинаний D&D 5e"}
          </h1>
        </div>
        {!isMobile && (
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
        )}
      </div>
      
      <div className="mb-4 flex justify-end">
        <ThemeSelector />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Боковая панель фильтров - скрыта на мобильных */}
        {!isMobile && (
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
        )}

        <div className="md:col-span-3">
          {isMobile && (
            <div className="mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Искать заклинание..."
                  className="w-full pl-10 py-2 rounded-lg border border-accent bg-background/60"
                />
              </div>
            </div>
          )}

          <Card className="border border-accent bg-card/70 h-full">
            <CardContent className="p-0">
              <div className="p-4 bg-card/60 border-b border-accent flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {filteredSpells.length} заклинаний найдено
                </h3>
                {isMobile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Фильтры
                  </Button>
                )}
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

      {/* Мобильная навигация и фильтры */}
      {isMobile && (
        <>
          <MobileNavigation />
          <MobileFilters />
        </>
      )}
    </div>
  );
};

export default SpellBookViewer;
