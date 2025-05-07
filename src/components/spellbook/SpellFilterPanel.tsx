
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';

interface SpellFilterPanelProps {
  allLevels: number[];
  allSchools: string[];
  allClasses: string[];
  activeLevel: number[];
  activeSchool: string[];
  activeClass: string[];
  toggleLevel: (level: number) => void;
  toggleSchool: (school: string) => void;
  toggleClass: (className: string) => void;
  clearFilters: () => void;
}

const SpellFilterPanel: React.FC<SpellFilterPanelProps> = ({
  allLevels,
  allSchools,
  allClasses,
  activeLevel,
  activeSchool,
  activeClass,
  toggleLevel,
  toggleSchool,
  toggleClass,
  clearFilters,
}) => {
  const { themeStyles } = useTheme();
  
  const getLevelName = (level: number) => {
    return level === 0 ? 'Заговор' : `${level}-й уровень`;
  };

  return (
    <div className="bg-black/20 border border-accent/30 rounded-md p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-auto">
          <h3 className="text-sm font-medium mb-2" style={{ color: themeStyles?.textColor }}>Уровень</h3>
          <div className="flex flex-wrap gap-1">
            {allLevels.map((level) => (
              <Badge
                key={level}
                variant={activeLevel.includes(level) ? "default" : "outline"}
                className="cursor-pointer"
                style={{
                  backgroundColor: activeLevel.includes(level) ? themeStyles?.accent : 'transparent',
                  borderColor: themeStyles?.accent,
                  color: activeLevel.includes(level) ? '#fff' : themeStyles?.textColor,
                }}
                onClick={() => toggleLevel(level)}
              >
                {getLevelName(level)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <h3 className="text-sm font-medium mb-2" style={{ color: themeStyles?.textColor }}>Школа</h3>
          <ScrollArea className="h-24 sm:h-auto">
            <div className="flex flex-wrap gap-1">
              {allSchools.map((school) => (
                <Badge
                  key={school}
                  variant={activeSchool.includes(school) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: activeSchool.includes(school) ? themeStyles?.accent : 'transparent',
                    borderColor: themeStyles?.accent,
                    color: activeSchool.includes(school) ? '#fff' : themeStyles?.textColor,
                  }}
                  onClick={() => toggleSchool(school)}
                >
                  {school}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="w-full sm:w-auto">
          <h3 className="text-sm font-medium mb-2" style={{ color: themeStyles?.textColor }}>Класс</h3>
          <ScrollArea className="h-24 sm:h-auto">
            <div className="flex flex-wrap gap-1">
              {allClasses.map((className) => (
                <Badge
                  key={className}
                  variant={activeClass.includes(className) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: activeClass.includes(className) ? themeStyles?.accent : 'transparent',
                    borderColor: themeStyles?.accent,
                    color: activeClass.includes(className) ? '#fff' : themeStyles?.textColor,
                  }}
                  onClick={() => toggleClass(className)}
                >
                  {className}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-accent flex items-center"
          >
            <X className="mr-1 h-4 w-4" />
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpellFilterPanel;
