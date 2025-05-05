
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

interface SpellFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeLevel: number[];
  toggleLevel: (level: number) => void;
  activeSchool: string[];
  toggleSchool: (school: string) => void;
  activeClass: string[];
  toggleClass: (className: string) => void;
  clearFilters: () => void;
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  totalFound: number;
  totalSpells: number;
}

const SpellFilters: React.FC<SpellFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  activeLevel,
  toggleLevel,
  activeSchool,
  toggleSchool,
  activeClass,
  toggleClass,
  clearFilters,
  allLevels,
  allSchools,
  allClasses,
  getBadgeColor,
  getSchoolBadgeColor,
  totalFound,
  totalSpells
}) => {
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const isAnyFilterActive = searchTerm || activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0;

  return (
    <Card className="p-4 bg-black/60 backdrop-blur-lg border-accent/30">
      <CardHeader className="px-0 pt-0">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск заклинаний..."
            className="pl-8 pr-8 bg-black/40"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-1 py-0">
        <div className="mb-4 p-2 bg-black/40 rounded border border-white/10">
          <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground">
            <span>Найдено: <strong className="text-white">{totalFound}</strong> заклинаний</span>
            <span>Всего в базе: {totalSpells}</span>
          </div>
          
          {isAnyFilterActive && (
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters} 
                className="h-6 px-2 text-xs"
                style={{ borderColor: `${currentTheme.accent}40` }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
        
        <ScrollArea className="pr-4 max-h-[calc(100vh-400px)]">
          {/* Фильтр по уровню */}
          <div className="mb-4">
            <CardTitle className="text-sm font-semibold mb-2">Уровень</CardTitle>
            <div className="flex flex-wrap gap-1">
              {allLevels.map(level => (
                <Badge
                  key={level}
                  variant={activeLevel.includes(level) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{ 
                    backgroundColor: activeLevel.includes(level) 
                      ? getBadgeColor(level) 
                      : 'transparent',
                    borderColor: getBadgeColor(level),
                    opacity: activeLevel.includes(level) ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleLevel(level)}
                >
                  {level === 0 ? 'Заговор' : level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Фильтр по школе */}
          <div className="mb-4">
            <CardTitle className="text-sm font-semibold mb-2">Школа</CardTitle>
            <div className="flex flex-wrap gap-1">
              {allSchools.map(school => (
                <Badge
                  key={school}
                  variant={activeSchool.includes(school) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{ 
                    backgroundColor: activeSchool.includes(school) 
                      ? getSchoolBadgeColor(school) 
                      : 'transparent',
                    borderColor: getSchoolBadgeColor(school),
                    opacity: activeSchool.includes(school) ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleSchool(school)}
                >
                  {school}
                </Badge>
              ))}
            </div>
          </div>

          {/* Фильтр по классам */}
          <div className="mb-4">
            <CardTitle className="text-sm font-semibold mb-2">Класс</CardTitle>
            <div className="flex flex-wrap gap-1">
              {allClasses.map(className => (
                <Badge
                  key={className}
                  variant={activeClass.includes(className) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{ 
                    backgroundColor: activeClass.includes(className) 
                      ? currentTheme.accent 
                      : 'transparent',
                    borderColor: `${currentTheme.accent}80`,
                    opacity: activeClass.includes(className) ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleClass(className)}
                >
                  {className}
                </Badge>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SpellFilters;
