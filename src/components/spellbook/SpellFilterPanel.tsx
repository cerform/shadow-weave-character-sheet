
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Sparkles, BookOpen, Wand, Star, Eye, Zap } from 'lucide-react';

interface SpellFilterPanelProps {
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
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  isRitualOnly: boolean;
  isConcentrationOnly: boolean;
  toggleRitualOnly: () => void;
  toggleConcentrationOnly: () => void;
  advancedFiltersOpen: boolean;
  toggleAdvancedFilters: () => void;
}

const SpellFilterPanel: React.FC<SpellFilterPanelProps> = ({
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
  getBadgeColor,
  getSchoolBadgeColor,
  isRitualOnly,
  isConcentrationOnly,
  toggleRitualOnly,
  toggleConcentrationOnly,
  advancedFiltersOpen,
  toggleAdvancedFilters
}) => {
  const getLevelIcon = (level: number) => {
    if (level === 0) return <Sparkles className="w-4 h-4" />;
    if (level <= 3) return <BookOpen className="w-4 h-4" />;
    if (level <= 6) return <Wand className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getLevelName = (level: number) => {
    return level === 0 ? "Заговоры" : `${level} уровень`;
  };

  return (
    <div className="space-y-6">
      {/* Основные фильтры */}
      <div>
        <h4 className="font-semibold mb-3">Уровень</h4>
        <div className="grid grid-cols-2 gap-2">
          {allLevels.map((level) => {
            const isActive = activeLevel.includes(level);
            return (
              <Button
                key={`level-${level}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLevel(level)}
                className="justify-start"
              >
                <div className="flex items-center space-x-2">
                  {getLevelIcon(level)}
                  <span>{getLevelName(level)}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3">Школа магии</h4>
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {allSchools.map((school) => {
              const isActive = activeSchool.includes(school);
              return (
                <Button
                  key={`school-${school}`}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSchool(school)}
                  className="w-full justify-start"
                >
                  {school}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3">Класс</h4>
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {allClasses.map((cls) => {
              const isActive = activeClass.includes(cls);
              return (
                <Button
                  key={`class-${cls}`}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleClass(cls)}
                  className="w-full justify-start"
                >
                  {cls}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Специальные фильтры */}
      <div>
        <h4 className="font-semibold mb-3">Специальные свойства</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="ritual-only" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Только ритуалы</span>
            </Label>
            <Switch
              id="ritual-only"
              checked={isRitualOnly}
              onCheckedChange={toggleRitualOnly}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="concentration-only" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Только концентрация</span>
            </Label>
            <Switch
              id="concentration-only"
              checked={isConcentrationOnly}
              onCheckedChange={toggleConcentrationOnly}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Кнопка сброса */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={clearFilters}
      >
        <X className="w-4 h-4 mr-2" />
        Сбросить все фильтры
      </Button>

      {/* Индикатор активных фильтров */}
      {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || isRitualOnly || isConcentrationOnly) && (
        <div className="flex flex-wrap gap-1">
          {activeLevel.length > 0 && (
            <Badge variant="secondary">
              Уровней: {activeLevel.length}
            </Badge>
          )}
          {activeSchool.length > 0 && (
            <Badge variant="secondary">
              Школ: {activeSchool.length}
            </Badge>
          )}
          {activeClass.length > 0 && (
            <Badge variant="secondary">
              Классов: {activeClass.length}
            </Badge>
          )}
          {isRitualOnly && (
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              Ритуалы
            </Badge>
          )}
          {isConcentrationOnly && (
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              Концентрация
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SpellFilterPanel;
