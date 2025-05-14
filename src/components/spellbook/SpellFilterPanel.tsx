
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from 'lucide-react';

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

const SpellFilterPanel: React.FC<SpellFilterPanelProps> = ({
  activeLevel,
  setActiveLevel,
  activeSchool,
  setActiveSchool,
  activeClass,
  setActiveClass,
  searchTerm,
  setSearchTerm,
  allLevels,
  allSchools,
  allClasses,
  ritualFilter,
  setRitualFilter,
  concentrationFilter,
  setConcentrationFilter,
  resetFilters
}) => {
  const handleLevelToggle = (level: number) => {
    if (activeLevel.includes(level)) {
      setActiveLevel(activeLevel.filter(l => l !== level));
    } else {
      setActiveLevel([...activeLevel, level]);
    }
  };

  const handleSchoolToggle = (school: string) => {
    if (activeSchool.includes(school)) {
      setActiveSchool(activeSchool.filter(s => s !== school));
    } else {
      setActiveSchool([...activeSchool, school]);
    }
  };

  const handleClassToggle = (cls: string) => {
    if (activeClass.includes(cls)) {
      setActiveClass(activeClass.filter(c => c !== cls));
    } else {
      setActiveClass([...activeClass, cls]);
    }
  };

  const handleRitualToggle = () => {
    // Трехстороннее состояние: null -> true -> false -> null
    if (ritualFilter === null) {
      setRitualFilter(true);
    } else if (ritualFilter === true) {
      setRitualFilter(false);
    } else {
      setRitualFilter(null);
    }
  };

  const handleConcentrationToggle = () => {
    // Трехстороннее состояние: null -> true -> false -> null
    if (concentrationFilter === null) {
      setConcentrationFilter(true);
    } else if (concentrationFilter === true) {
      setConcentrationFilter(false);
    } else {
      setConcentrationFilter(null);
    }
  };

  const getRitualLabel = () => {
    if (ritualFilter === null) return "Ритуал: Любой";
    if (ritualFilter === true) return "Только ритуалы";
    return "Исключить ритуалы";
  };

  const getConcentrationLabel = () => {
    if (concentrationFilter === null) return "Концентрация: Любая";
    if (concentrationFilter === true) return "Только с концентрацией";
    return "Без концентрации";
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры заклинаний
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск по названию */}
        <div>
          <Label htmlFor="search">Поиск заклинания</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="search"
              className="pl-8"
              placeholder="Введите название..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Фильтр по уровню заклинаний */}
        <div>
          <Label className="block mb-2">Уровень</Label>
          <div className="flex flex-wrap gap-2">
            {allLevels.map(level => (
              <Badge
                key={`level-${level}`}
                variant={activeLevel.includes(level) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleLevelToggle(level)}
              >
                {level === 0 ? "Заговор" : `${level}`}
              </Badge>
            ))}
          </div>
        </div>

        {/* Фильтр по школам магии */}
        <div>
          <Label className="block mb-2">Школа магии</Label>
          <div className="flex flex-wrap gap-2">
            {allSchools.map(school => (
              <Badge
                key={`school-${school}`}
                variant={activeSchool.includes(school) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSchoolToggle(school)}
              >
                {school}
              </Badge>
            ))}
          </div>
        </div>

        {/* Фильтр по классам персонажей */}
        <div>
          <Label className="block mb-2">Класс персонажа</Label>
          <div className="flex flex-wrap gap-2">
            {allClasses.map(cls => (
              <Badge
                key={`class-${cls}`}
                variant={activeClass.includes(cls) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleClassToggle(cls)}
              >
                {cls}
              </Badge>
            ))}
          </div>
        </div>

        {/* Дополнительные фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Button 
            variant={ritualFilter !== null ? "default" : "outline"} 
            size="sm" 
            onClick={handleRitualToggle}
            className={`justify-start ${ritualFilter === false ? 'bg-destructive' : ''}`}
          >
            {getRitualLabel()}
          </Button>
          
          <Button 
            variant={concentrationFilter !== null ? "default" : "outline"} 
            size="sm" 
            onClick={handleConcentrationToggle}
            className={`justify-start ${concentrationFilter === false ? 'bg-destructive' : ''}`}
          >
            {getConcentrationLabel()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellFilterPanel;
