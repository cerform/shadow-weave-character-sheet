
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellFiltersProps {
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  clearFilters: () => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  getBadgeColor?: (level: number) => string;
  getSchoolBadgeColor?: (school: string) => string;
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
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <CardTitle style={{ color: currentTheme.textColor }}>Фильтры</CardTitle>
          {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="text-destructive hover:text-destructive"
            >
              Сбросить все
            </Button>
          )}
        </div>

        <Separator style={{ backgroundColor: `${currentTheme.accent}30` }} />
        
        <Card style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: `${currentTheme.accent}40` }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: currentTheme.textColor }}>Уровень</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {allLevels.map((level) => (
              <Button
                key={`filter-level-${level}`}
                variant={activeLevel.includes(level) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLevel(level)}
                style={activeLevel.includes(level) ? { backgroundColor: currentTheme.accent, color: currentTheme.buttonText } : {}}
              >
                {level === 0 ? "Заговоры" : `${level} уровень`}
              </Button>
            ))}
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: `${currentTheme.accent}40` }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: currentTheme.textColor }}>Школа магии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allSchools.map((school) => (
              <Button
                key={`filter-school-${school}`}
                variant={activeSchool.includes(school) ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => toggleSchool(school)}
                style={activeSchool.includes(school) ? { backgroundColor: currentTheme.accent, color: currentTheme.buttonText } : {}}
              >
                {school}
              </Button>
            ))}
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: `${currentTheme.accent}40` }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: currentTheme.textColor }}>Класс</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allClasses.map((cls) => (
              <Button
                key={`filter-class-${cls}`}
                variant={activeClass.includes(cls) ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => toggleClass(cls)}
                style={activeClass.includes(cls) ? { backgroundColor: currentTheme.accent, color: currentTheme.buttonText } : {}}
              >
                {cls}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default SpellFilters;
