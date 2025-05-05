
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, BookOpen, Sparkles, Wand, Book, Star, Filter } from 'lucide-react';

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
  const getLevelIcon = (level: number) => {
    if (level === 0) return <Sparkles size={16} />;
    if (level <= 3) return <BookOpen size={16} />;
    if (level <= 6) return <Wand size={16} />;
    return <Star size={16} />;
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: currentTheme.accent }}>
        <Filter className="mr-2 h-5 w-5" />
        Фильтры заклинаний
      </h3>
      
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 bg-black/30"
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.textColor,
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
      
      <h4 className="text-md font-semibold mb-2 flex items-center" style={{ color: currentTheme.textColor }}>
        <BookOpen className="mr-2 h-4 w-4" style={{ color: currentTheme.accent }}/>
        Уровень заклинания
      </h4>
      <ScrollArea className="h-[120px] pr-3 mb-4">
        <div className="grid grid-cols-2 gap-2">
          {allLevels.map((level) => {
            const isActive = activeLevel.includes(level);
            const levelName = level === 0 ? "Заговор" : `${level} уровень`;
            
            return (
              <Button
                key={`filter-level-${level}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLevel(level)}
                className={`justify-start transition-all duration-200 ${isActive ? 'scale-105' : ''}`}
                style={{ 
                  backgroundColor: isActive ? currentTheme.accent : 'rgba(0, 0, 0, 0.3)',
                  borderColor: currentTheme.accent,
                  color: isActive ? '#fff' : currentTheme.textColor,
                  boxShadow: isActive ? `0 0 8px ${currentTheme.accent}80` : 'none'
                }}
              >
                <div className="flex items-center">
                  {getLevelIcon(level)}
                  <span className="ml-2">{levelName}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      <h4 className="text-md font-semibold mb-2 flex items-center" style={{ color: currentTheme.textColor }}>
        <Wand className="mr-2 h-4 w-4" style={{ color: currentTheme.accent }}/>
        Школа магии
      </h4>
      <ScrollArea className="h-[180px] pr-3 mb-4">
        <div className="space-y-1">
          {allSchools.map((school) => {
            const isActive = activeSchool.includes(school);
            
            return (
              <Button
                key={`filter-school-${school}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSchool(school)}
                className={`w-full justify-start mb-1 transition-all duration-200 ${isActive ? 'scale-105' : ''}`}
                style={{ 
                  backgroundColor: isActive ? currentTheme.accent : 'rgba(0, 0, 0, 0.3)',
                  borderColor: currentTheme.accent,
                  color: isActive ? '#fff' : currentTheme.textColor,
                  boxShadow: isActive ? `0 0 8px ${currentTheme.accent}80` : 'none'
                }}
              >
                {school}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      <h4 className="text-md font-semibold mb-2 flex items-center" style={{ color: currentTheme.textColor }}>
        <Book className="mr-2 h-4 w-4" style={{ color: currentTheme.accent }}/>
        Класс персонажа
      </h4>
      <ScrollArea className="h-[180px] pr-3 mb-4">
        <div className="space-y-1">
          {allClasses.map((cls) => {
            const isActive = activeClass.includes(cls);
            
            return (
              <Button
                key={`filter-class-${cls}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleClass(cls)}
                className={`w-full justify-start mb-1 transition-all duration-200 ${isActive ? 'scale-105' : ''}`}
                style={{ 
                  backgroundColor: isActive ? currentTheme.accent : 'rgba(0, 0, 0, 0.3)',
                  borderColor: currentTheme.accent,
                  color: isActive ? '#fff' : currentTheme.textColor,
                  boxShadow: isActive ? `0 0 8px ${currentTheme.accent}80` : 'none'
                }}
              >
                {cls}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      <Separator className="my-4" style={{ backgroundColor: `${currentTheme.accent}30` }} />
      
      <Button 
        variant="destructive" 
        className="w-full transition-all duration-200 hover:scale-105"
        onClick={clearFilters}
        style={{ 
          backgroundColor: currentTheme.accent,
          color: '#fff',
          boxShadow: `0 0 8px ${currentTheme.accent}80`
        }}
      >
        <X className="mr-2 h-4 w-4" />
        Сбросить все фильтры
      </Button>
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {activeLevel.length > 0 && (
            <Badge className="transition-all duration-200" style={{ 
              backgroundColor: currentTheme.accent, 
              color: '#fff',
              boxShadow: `0 0 5px ${currentTheme.accent}80`
            }}>
              Уровней: {activeLevel.length}
            </Badge>
          )}
          
          {activeSchool.length > 0 && (
            <Badge className="transition-all duration-200" style={{ 
              backgroundColor: currentTheme.accent, 
              color: '#fff',
              boxShadow: `0 0 5px ${currentTheme.accent}80`
            }}>
              Школ: {activeSchool.length}
            </Badge>
          )}
          
          {activeClass.length > 0 && (
            <Badge className="transition-all duration-200" style={{ 
              backgroundColor: currentTheme.accent, 
              color: '#fff',
              boxShadow: `0 0 5px ${currentTheme.accent}80`
            }}>
              Классов: {activeClass.length}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellFilters;
