
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

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
  clearFilters
}) => {
  // Преобразование уровня в строку
  const getLevelText = (level: number): string => {
    return level === 0 ? "Заговор" : `${level} уровень`;
  };

  const hasActiveFilters = activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0;

  return (
    <Card className="mb-6 border border-accent/20">
      <CardContent className="p-4 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Фильтры</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-accent">
              Сбросить
            </Button>
          )}
        </div>

        {/* Фильтр по уровням */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Уровень</h4>
          <div className="flex flex-wrap gap-2">
            {allLevels.map(level => (
              <Badge
                key={`level-${level}`}
                variant={activeLevel.includes(level) ? "default" : "outline"}
                className={`cursor-pointer ${
                  activeLevel.includes(level) ? "bg-accent hover:bg-accent/80" : "bg-background hover:bg-accent/10"
                }`}
                onClick={() => toggleLevel(level)}
              >
                {getLevelText(level)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Фильтр по школам */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Школа</h4>
          <div className="flex flex-wrap gap-2">
            {allSchools.map(school => (
              <Badge
                key={`school-${school}`}
                variant={activeSchool.includes(school) ? "default" : "outline"}
                className={`cursor-pointer ${
                  activeSchool.includes(school) ? "bg-accent hover:bg-accent/80" : "bg-background hover:bg-accent/10"
                }`}
                onClick={() => toggleSchool(school)}
              >
                {school}
              </Badge>
            ))}
          </div>
        </div>

        {/* Фильтр по классам */}
        <div>
          <h4 className="text-sm font-medium mb-2">Класс</h4>
          <div className="flex flex-wrap gap-2">
            {allClasses.map(className => (
              <Badge
                key={`class-${className}`}
                variant={activeClass.includes(className) ? "default" : "outline"}
                className={`cursor-pointer ${
                  activeClass.includes(className) ? "bg-accent hover:bg-accent/80" : "bg-background hover:bg-accent/10"
                }`}
                onClick={() => toggleClass(className)}
              >
                {className}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellFilterPanel;
