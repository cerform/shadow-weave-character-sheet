
import React, { useEffect, useState } from 'react';
import SpellCard from './SpellCard';
import SpellFilterPanel from './SpellFilterPanel';
import SpellDetailModal from './SpellDetailModal';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import SpellDatabaseManager from './SpellDatabaseManager';
import { CharacterSpell } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from "@/components/ui/scroll-area";
import { themes } from '@/lib/themes';

// Добавим интерфейс для аргументов SpellFilterPanel
interface SpellFilterPanelProps {
  activeLevel: number[];
  setActiveLevel: (level: number[]) => void;
  activeSchool: string[];
  setActiveSchool: (school: string[]) => void;
  activeClass: string[];
  setActiveClass: (cls: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  ritualFilter: boolean | null;
  setRitualFilter: (value: boolean | null) => void;
  concentrationFilter: boolean | null;
  setConcentrationFilter: (value: boolean | null) => void;
  resetFilters: () => void;
}

const SpellBookViewer: React.FC = () => {
  const { themeStyles, theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const { spells, filteredSpells, selectSpell, searchTerm, setSearchTerm, 
    levelFilter, setLevelFilter, schoolFilter, setSchoolFilter, 
    classFilter, setClassFilter, ritualFilter, setRitualFilter, 
    concentrationFilter, setConcentrationFilter, resetFilters } = useSpellbook();
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);

  // Получаем уникальные значения для фильтров из доступных заклинаний
  const allLevels = React.useMemo(() => {
    const levels = new Set(spells?.map(spell => spell.level) || []);
    return Array.from(levels).sort((a, b) => a - b);
  }, [spells]);

  const allSchools = React.useMemo(() => {
    const schools = new Set<string>();
    spells?.forEach(spell => {
      if (spell.school) schools.add(spell.school);
    });
    return Array.from(schools).sort();
  }, [spells]);

  const allClasses = React.useMemo(() => {
    const classes = new Set<string>();
    spells?.forEach(spell => {
      if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      } else if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => {
          if (typeof cls === 'string') classes.add(cls);
        });
      }
    });
    return Array.from(classes).sort();
  }, [spells]);

  useEffect(() => {
    console.log("SpellBookViewer: Загружено заклинаний", spells?.length || 0);
  }, [spells]);

  const handleSpellClick = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  // Создаем пустой список заклинаний, если он undefined
  const safeFilteredSpells = filteredSpells || [];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Фильтры */}
      <aside className="lg:w-1/4">
        <SpellFilterPanel
          activeLevel={levelFilter}
          setActiveLevel={setLevelFilter}
          activeSchool={schoolFilter}
          setActiveSchool={setSchoolFilter}
          activeClass={classFilter}
          setActiveClass={setClassFilter}
          searchTerm={searchTerm || ""}
          setSearchTerm={setSearchTerm}
          allLevels={allLevels}
          allSchools={allSchools}
          allClasses={allClasses}
          ritualFilter={ritualFilter}
          setRitualFilter={setRitualFilter}
          concentrationFilter={concentrationFilter}
          setConcentrationFilter={setConcentrationFilter}
          resetFilters={resetFilters}
        />
        <SpellDatabaseManager />
      </aside>

      {/* Список заклинаний */}
      <div className="lg:w-3/4">
        <ScrollArea className="h-[600px] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeFilteredSpells.map(spell => (
              <SpellCard
                key={spell.id}
                spell={spell}
                onClick={() => handleSpellClick(spell)}
                currentTheme={currentTheme}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Модальное окно с деталями */}
      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          theme={currentTheme}
        />
      )}
    </div>
  );
};

export default SpellBookViewer;
