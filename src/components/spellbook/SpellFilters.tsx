
import React from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  return (
    <Card className="border border-accent p-4 bg-card/60">
      <h3 className="text-xl font-semibold mb-3">Поиск</h3>
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Искать заклинание..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-background/50 border-accent"
          />
          <Search className="h-4 w-4 absolute top-3 left-2 text-muted-foreground" />
        </div>
        
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium mb-2">Фильтры:</h4>
          {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="text-xs flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Сбросить
            </Button>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Уровень:</h4>
          <div className="flex flex-wrap gap-2">
            {allLevels.map(level => (
              <Badge
                key={level}
                className={`cursor-pointer ${activeLevel.includes(level) 
                  ? getBadgeColor(level)
                  : 'bg-secondary'}`}
                onClick={() => toggleLevel(level)}
                style={{
                  backgroundColor: activeLevel.includes(level) ? currentTheme.accent : undefined,
                  color: activeLevel.includes(level) ? currentTheme.textColor : undefined,
                  borderColor: activeLevel.includes(level) ? currentTheme.accent : undefined
                }}
              >
                {level === 0 ? "Заговор" : `${level}-й`}
                {activeLevel.includes(level) && <Check className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Школа:</h4>
          <div className="flex flex-wrap gap-2">
            {allSchools.map(school => (
              <Badge
                key={school}
                className={`cursor-pointer ${activeSchool.includes(school) 
                  ? getSchoolBadgeColor(school)
                  : 'bg-secondary'}`}
                onClick={() => toggleSchool(school)}
                style={{
                  backgroundColor: activeSchool.includes(school) ? currentTheme.accent : undefined,
                  color: activeSchool.includes(school) ? currentTheme.textColor : undefined,
                  borderColor: activeSchool.includes(school) ? currentTheme.accent : undefined
                }}
              >
                {school}
                {activeSchool.includes(school) && <Check className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Класс:</h4>
          <div className="flex flex-wrap gap-2">
            {allClasses.map(className => (
              <Badge
                key={className}
                className={`cursor-pointer ${activeClass.includes(className) 
                  ? 'bg-primary'
                  : 'bg-secondary'}`}
                onClick={() => toggleClass(className)}
                style={{
                  backgroundColor: activeClass.includes(className) ? currentTheme.accent : undefined,
                  color: activeClass.includes(className) ? currentTheme.textColor : undefined,
                  borderColor: activeClass.includes(className) ? currentTheme.accent : undefined
                }}
              >
                {className}
                {activeClass.includes(className) && <Check className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpellFilters;
