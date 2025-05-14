import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpellData } from '@/types/spells';
import { useSpellbook } from '@/hooks/spellbook';
import SpellDetailModal from './SpellDetailModal';
import SpellCard from './SpellCard';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, Book, Filter, X } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Get all unique schools from the spells
const getSchools = (spells: SpellData[]): string[] => {
  const schoolsSet = new Set<string>();
  spells.forEach(spell => {
    if (spell.school) {
      schoolsSet.add(spell.school);
    }
  });
  return Array.from(schoolsSet).sort();
};

// Get all unique classes from the spells
const getClasses = (spells: SpellData[]): string[] => {
  const classesSet = new Set<string>();
  spells.forEach(spell => {
    if (typeof spell.classes === 'string') {
      classesSet.add(spell.classes);
    } else if (Array.isArray(spell.classes)) {
      spell.classes.forEach(c => classesSet.add(c));
    }
  });
  return Array.from(classesSet).sort();
};

const SpellBookViewer = () => {
  const { 
    filteredSpells,
    spells, 
    searchTerm, 
    setSearchTerm, 
    setLevelFilter, 
    setSchoolFilter,
    setClassFilter, 
    setRitualFilter, 
    setConcentrationFilter,
    levelFilter,
    schoolFilter,
    classFilter,
    ritualFilter,
    concentrationFilter,
    resetFilters,
    selectSpell,
    selectedSpell,
  } = useSpellbook();
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [visibleSpells, setVisibleSpells] = useState<SpellData[]>([]);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const schools = getSchools(spells);
  const classes = getClasses(spells);
  
  // Update filtered spells when tab changes
  useEffect(() => {
    if (!filteredSpells) return;
    
    let visibleSpellsList = [...filteredSpells];
    
    // Filter by active tab
    if (activeTab === "cantrips") {
      visibleSpellsList = visibleSpellsList.filter(spell => spell.level === 0);
    } else if (activeTab !== "all") {
      const level = parseInt(activeTab);
      visibleSpellsList = visibleSpellsList.filter(spell => spell.level === level);
    }
    
    setVisibleSpells(visibleSpellsList);
  }, [activeTab, filteredSpells]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleResetFilters = () => {
    resetFilters();
    setActiveTab("all");
  };
  
  const handleOpenSpellDetails = (spell: SpellData) => {
    selectSpell(spell);
    setShowDetailModal(true);
  };
  
  const handleCloseSpellDetails = () => {
    setShowDetailModal(false);
    selectSpell(null);
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Фильтры */}
      <aside className="lg:w-1/4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Поиск заклинаний"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button onClick={handleResetFilters}>
              <X size={16} />
            </Button>
          </div>
          <Tabs>
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="cantrips">Канонические</TabsTrigger>
              <TabsTrigger value="1">1-й уровень</TabsTrigger>
              <TabsTrigger value="2">2-й уровень</TabsTrigger>
              <TabsTrigger value="3">3-й уровень</TabsTrigger>
              <TabsTrigger value="4">4-й уровень</TabsTrigger>
              <TabsTrigger value="5">5-й уровень</TabsTrigger>
              <TabsTrigger value="6">6-й уровень</TabsTrigger>
              <TabsTrigger value="7">7-й уровень</TabsTrigger>
              <TabsTrigger value="8">8-й уровень</TabsTrigger>
              <TabsTrigger value="9">9-й уровень</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1-й уровень</SelectItem>
                  <SelectItem value="2">2-й уровень</SelectItem>
                  <SelectItem value="3">3-й уровень</SelectItem>
                  <SelectItem value="4">4-й уровень</SelectItem>
                  <SelectItem value="5">5-й уровень</SelectItem>
                  <SelectItem value="6">6-й уровень</SelectItem>
                  <SelectItem value="7">7-й уровень</SelectItem>
                  <SelectItem value="8">8-й уровень</SelectItem>
                  <SelectItem value="9">9-й уровень</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Школа" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(school => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Класс" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
          <SpellDatabaseManager />
        </div>
      </aside>

      {/* Список заклинаний */}
      <div className="lg:w-3/4">
        <ScrollArea className="h-[600px] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSpells.map(spell => (
              <SpellCard
                key={spell.id}
                spell={spell}
                onClick={() => handleOpenSpellDetails(spell)}
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
          isOpen={showDetailModal}
          onClose={handleCloseSpellDetails}
          theme={currentTheme}
        />
      )}
    </div>
  );
};

export default SpellBookViewer;
