
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from 'lucide-react';

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
  getSchoolBadgeColor
}) => {
  return (
    <div className="filter-panel bg-card/80 backdrop-blur-md p-4 rounded-lg mb-6 animate-in fade-in-50 slide-in-from-top-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Фильтры заклинаний</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2"
        >
          Сбросить <X className="ml-1 h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Уровень</h4>
          <div className="flex flex-wrap gap-2">
            {allLevels.map(level => (
              <Badge
                key={`level-filter-${level}`}
                variant={activeLevel.includes(level) ? "default" : "outline"}
                className="spell-filter-badge cursor-pointer"
                style={activeLevel.includes(level) ? {
                  backgroundColor: getBadgeColor(level),
                  color: '#fff'
                } : {}}
                onClick={() => toggleLevel(level)}
              >
                {level === 0 ? 'Заговор' : level}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Школа</h4>
          <div className="flex flex-wrap gap-2">
            {allSchools.map(school => (
              <Badge
                key={`school-filter-${school}`}
                variant={activeSchool.includes(school) ? "default" : "outline"}
                className="spell-filter-badge cursor-pointer"
                style={activeSchool.includes(school) ? {
                  backgroundColor: getSchoolBadgeColor(school),
                  color: '#fff'
                } : {
                  borderColor: getSchoolBadgeColor(school),
                  color: activeSchool.includes(school) ? '#fff' : getSchoolBadgeColor(school)
                }}
                onClick={() => toggleSchool(school)}
              >
                {school}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Класс</h4>
          <div className="flex flex-wrap gap-2">
            {allClasses.map(cls => (
              <Badge
                key={`class-filter-${cls}`}
                variant={activeClass.includes(cls) ? "default" : "outline"}
                className="spell-filter-badge cursor-pointer"
                onClick={() => toggleClass(cls)}
              >
                {cls}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
        <>
          <Separator className="my-4" />
          <div>
            <h4 className="text-sm font-medium mb-2">Активные фильтры</h4>
            <div className="flex flex-wrap gap-2">
              {activeLevel.map(level => (
                <Badge
                  key={`active-level-${level}`}
                  variant="default"
                  className="flex items-center"
                  style={{
                    backgroundColor: getBadgeColor(level),
                    color: '#fff'
                  }}
                >
                  {level === 0 ? 'Заговор' : `Уровень ${level}`}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => toggleLevel(level)}
                  />
                </Badge>
              ))}
              
              {activeSchool.map(school => (
                <Badge
                  key={`active-school-${school}`}
                  variant="default"
                  className="flex items-center"
                  style={{
                    backgroundColor: getSchoolBadgeColor(school),
                    color: '#fff'
                  }}
                >
                  {school}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => toggleSchool(school)}
                  />
                </Badge>
              ))}
              
              {activeClass.map(cls => (
                <Badge
                  key={`active-class-${cls}`}
                  variant="default"
                  className="flex items-center"
                >
                  {cls}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => toggleClass(cls)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpellFilterPanel;
