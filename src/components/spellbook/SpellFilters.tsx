
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from 'lucide-react';

interface SpellFiltersProps {
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (cls: string) => void;
  clearFilters: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentTheme: any;
}

const SpellFilters: React.FC<SpellFiltersProps> = ({
  activeLevel,
  activeSchool,
  activeClass,
  allLevels,
  allSchools,
  allClasses,
  toggleLevel,
  toggleSchool,
  toggleClass,
  clearFilters,
  searchTerm,
  setSearchTerm,
  currentTheme
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.accent }}>
        Фильтры заклинаний
      </h3>
      
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.textColor,
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
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
      
      <Separator className="my-4" style={{ backgroundColor: `${currentTheme.accent}30` }} />
      
      <h4 className="text-md font-semibold mb-2" style={{ color: currentTheme.textColor }}>
        Уровень заклинания
      </h4>
      <ScrollArea className="h-[120px] pr-3 mb-4">
        <div className="grid grid-cols-2 gap-2">
          {allLevels.map((level) => (
            <Button
              key={`filter-level-${level}`}
              variant={activeLevel.includes(level) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLevel(level)}
              className="justify-start"
              style={{ 
                backgroundColor: activeLevel.includes(level) ? currentTheme.accent : 'transparent',
                borderColor: currentTheme.accent,
                color: activeLevel.includes(level) ? '#fff' : currentTheme.textColor
              }}
            >
              {level === 0 ? "Заговор" : `${level} уровень`}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      <h4 className="text-md font-semibold mb-2" style={{ color: currentTheme.textColor }}>
        Школа магии
      </h4>
      <ScrollArea className="h-[180px] pr-3 mb-4">
        <div className="space-y-1">
          {allSchools.map((school) => (
            <Button
              key={`filter-school-${school}`}
              variant={activeSchool.includes(school) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSchool(school)}
              className="w-full justify-start mb-1"
              style={{ 
                backgroundColor: activeSchool.includes(school) ? currentTheme.accent : 'transparent',
                borderColor: currentTheme.accent,
                color: activeSchool.includes(school) ? '#fff' : currentTheme.textColor
              }}
            >
              {school}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      <h4 className="text-md font-semibold mb-2" style={{ color: currentTheme.textColor }}>
        Класс персонажа
      </h4>
      <ScrollArea className="h-[180px] pr-3 mb-4">
        <div className="space-y-1">
          {allClasses.map((cls) => (
            <Button
              key={`filter-class-${cls}`}
              variant={activeClass.includes(cls) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleClass(cls)}
              className="w-full justify-start mb-1"
              style={{ 
                backgroundColor: activeClass.includes(cls) ? currentTheme.accent : 'transparent',
                borderColor: currentTheme.accent,
                color: activeClass.includes(cls) ? '#fff' : currentTheme.textColor
              }}
            >
              {cls}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      <Separator className="my-4" style={{ backgroundColor: `${currentTheme.accent}30` }} />
      
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={clearFilters}
        style={{ 
          backgroundColor: currentTheme.accent,
          color: '#fff' 
        }}
      >
        Сбросить все фильтры
      </Button>
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {activeLevel.length > 0 && (
            <Badge style={{ backgroundColor: currentTheme.accent, color: '#fff' }}>
              Уровней: {activeLevel.length}
            </Badge>
          )}
          
          {activeSchool.length > 0 && (
            <Badge style={{ backgroundColor: currentTheme.accent, color: '#fff' }}>
              Школ: {activeSchool.length}
            </Badge>
          )}
          
          {activeClass.length > 0 && (
            <Badge style={{ backgroundColor: currentTheme.accent, color: '#fff' }}>
              Классов: {activeClass.length}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellFilters;
