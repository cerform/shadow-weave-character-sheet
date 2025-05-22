
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';

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
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

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
            <Popover open={levelDropdownOpen} onOpenChange={setLevelDropdownOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center justify-between w-full"
                >
                  Выбрать уровни ({activeLevel.length})
                  {levelDropdownOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2 max-h-60 overflow-auto">
                  {allLevels.map(level => (
                    <div key={`level-select-${level}`} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-md">
                      <Checkbox 
                        id={`level-${level}`} 
                        checked={activeLevel.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                      />
                      <label 
                        htmlFor={`level-${level}`}
                        className="flex-grow cursor-pointer text-sm font-medium"
                      >
                        {level === 0 ? 'Заговор' : `Уровень ${level}`}
                      </label>
                      {activeLevel.includes(level) && (
                        <Badge 
                          variant="default" 
                          className="ml-auto"
                          style={{
                            backgroundColor: getBadgeColor(level),
                            color: '#fff'
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {activeLevel.map(level => (
                <Badge
                  key={`level-filter-${level}`}
                  variant="default"
                  className="spell-filter-badge cursor-pointer"
                  style={{
                    backgroundColor: getBadgeColor(level),
                    color: '#fff'
                  }}
                  onClick={() => toggleLevel(level)}
                >
                  {level === 0 ? 'Заговор' : level}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Школа</h4>
          <div className="flex flex-wrap gap-2">
            <Popover open={schoolDropdownOpen} onOpenChange={setSchoolDropdownOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center justify-between w-full"
                >
                  Выбрать школы ({activeSchool.length})
                  {schoolDropdownOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2 max-h-60 overflow-auto">
                  {allSchools.map(school => (
                    <div key={`school-select-${school}`} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-md">
                      <Checkbox 
                        id={`school-${school}`} 
                        checked={activeSchool.includes(school)}
                        onCheckedChange={() => toggleSchool(school)}
                      />
                      <label 
                        htmlFor={`school-${school}`}
                        className="flex-grow cursor-pointer text-sm font-medium"
                      >
                        {school}
                      </label>
                      {activeSchool.includes(school) && (
                        <Badge 
                          variant="default" 
                          className="ml-auto"
                          style={{
                            backgroundColor: getSchoolBadgeColor(school),
                            color: '#fff'
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {activeSchool.map(school => (
                <Badge
                  key={`school-filter-${school}`}
                  variant="default"
                  className="spell-filter-badge cursor-pointer"
                  style={{
                    backgroundColor: getSchoolBadgeColor(school),
                    color: '#fff'
                  }}
                  onClick={() => toggleSchool(school)}
                >
                  {school}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Класс</h4>
          <div className="flex flex-wrap gap-2">
            <Popover open={classDropdownOpen} onOpenChange={setClassDropdownOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center justify-between w-full"
                >
                  Выбрать классы ({activeClass.length})
                  {classDropdownOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2 max-h-60 overflow-auto">
                  {allClasses.map(cls => (
                    <div key={`class-select-${cls}`} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-md">
                      <Checkbox 
                        id={`class-${cls}`} 
                        checked={activeClass.includes(cls)}
                        onCheckedChange={() => toggleClass(cls)}
                      />
                      <label 
                        htmlFor={`class-${cls}`}
                        className="flex-grow cursor-pointer text-sm font-medium"
                      >
                        {cls}
                      </label>
                      {activeClass.includes(cls) && (
                        <Badge variant="default" className="ml-auto">
                          <Check className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {activeClass.map(cls => (
                <Badge
                  key={`class-filter-${cls}`}
                  variant="default"
                  className="spell-filter-badge cursor-pointer"
                  onClick={() => toggleClass(cls)}
                >
                  {cls}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
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
