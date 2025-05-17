
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpellData } from '@/types/spells';
import { useSpellbook } from '@/hooks/spellbook';
import SpellDetailModal from './SpellDetailModal';
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
import { Search, Book, X, CircleAlert } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Компонент карточки заклинания
const SpellCard = ({ spell, onClick, currentTheme }: { 
  spell: SpellData; 
  onClick: () => void;
  currentTheme: any;
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      style={{ 
        backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.6)',
        borderColor: `${currentTheme.accent}80`,
        color: currentTheme.textColor
      }}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1" style={{ color: currentTheme.accent }}>{spell.name}</h3>
        <div className="text-sm opacity-75 flex flex-wrap gap-1 items-center mb-2">
          <span>{spell.level === 0 ? "Заговор" : `${spell.level} уровень`}</span>
          <span>•</span>
          <span>{spell.school}</span>
        </div>
        <div className="text-xs opacity-70 mb-2">
          <div>Время накладывания: {spell.castingTime}</div>
          <div>Дальность: {spell.range || "Касание"}</div>
          <div>Длительность: {spell.duration || "Мгновенная"}</div>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 flex flex-wrap gap-1">
        {spell.concentration && (
          <Badge variant="outline" className="text-xs" style={{ borderColor: currentTheme.accent }}>
            Концентрация
          </Badge>
        )}
        {spell.ritual && (
          <Badge variant="outline" className="text-xs" style={{ borderColor: currentTheme.accent }}>
            Ритуал
          </Badge>
        )}
        {Array.isArray(spell.classes) ? (
          spell.classes.slice(0, 2).map((cls, i) => (
            <Badge 
              key={i} 
              variant="secondary" 
              className="text-xs"
              style={{ backgroundColor: `${currentTheme.accent}30`, color: currentTheme.textColor }}
            >
              {cls}
            </Badge>
          ))
        ) : typeof spell.classes === 'string' ? (
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: `${currentTheme.accent}30`, color: currentTheme.textColor }}
          >
            {spell.classes}
          </Badge>
        ) : null}
      </CardFooter>
    </Card>
  );
};

const SpellBookViewer = () => {
  const { 
    filteredSpells,
    spells, 
    searchTerm, 
    setSearchTerm, 
    setLevelFilter, 
    setSchoolFilter,
    levelFilter,
    schoolFilter,
    resetFilters,
    selectSpell,
    selectedSpell,
    loading
  } = useSpellbook();
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [visibleSpells, setVisibleSpells] = useState<SpellData[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Получаем уникальные школы магии из списка заклинаний
  useEffect(() => {
    if (spells && spells.length > 0) {
      const schools = Array.from(new Set(spells.map(spell => spell.school))).sort();
      setSchoolOptions(schools);
      console.log(`Найдено школ магии: ${schools.length}`);
    }
  }, [spells]);
  
  // Обновляем отображаемые заклинания при изменениях
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
    
    console.log(`Отображаем заклинаний: ${visibleSpellsList.length}`);
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
    console.log("Открываем детали заклинания:", spell.name);
    selectSpell(spell);
    setShowDetailModal(true);
  };
  
  const handleCloseSpellDetails = () => {
    setShowDetailModal(false);
    selectSpell(null);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "all") {
      setLevelFilter([]);
    } else if (value === "cantrips") {
      setLevelFilter([0]);
    } else {
      setLevelFilter([parseInt(value)]);
    }
  };
  
  const handleSchoolChange = (value: string) => {
    if (value === "all") {
      setSchoolFilter([]);
    } else {
      setSchoolFilter([value]);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Фильтры */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск заклинаний"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <Button onClick={handleResetFilters} variant="outline" className="whitespace-nowrap">
              <X size={16} className="mr-1" /> Сбросить
            </Button>
            
            <Select onValueChange={handleSchoolChange} defaultValue="all">
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Школа магии" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все школы</SelectItem>
                {schoolOptions.map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full overflow-auto">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
              <TabsTrigger value="1">1 ур.</TabsTrigger>
              <TabsTrigger value="2">2 ур.</TabsTrigger>
              <TabsTrigger value="3">3 ур.</TabsTrigger>
              <TabsTrigger value="4">4 ур.</TabsTrigger>
              <TabsTrigger value="5">5 ур.</TabsTrigger>
              <TabsTrigger value="6">6 ур.</TabsTrigger>
              <TabsTrigger value="7">7 ур.</TabsTrigger>
              <TabsTrigger value="8">8 ур.</TabsTrigger>
              <TabsTrigger value="9">9 ур.</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="text-sm opacity-70 flex justify-between items-center">
            <div>
              {loading ? "Загрузка заклинаний..." : `Найдено заклинаний: ${visibleSpells.length}`}
            </div>
            {levelFilter.length > 0 && (
              <Badge variant="outline">
                {levelFilter[0] === 0 ? "Заговоры" : `${levelFilter[0]} уровень`}
              </Badge>
            )}
            {schoolFilter.length > 0 && (
              <Badge variant="outline">
                {schoolFilter[0]}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Список заклинаний */}
        <ScrollArea className="h-[70vh]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Загрузка заклинаний...</p>
            </div>
          ) : visibleSpells.length > 0 ? (
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
          ) : (
            <div className="p-8 text-center">
              <CircleAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Заклинания не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">
                Попробуйте изменить параметры поиска или сбросить фильтры
              </p>
            </div>
          )}
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
