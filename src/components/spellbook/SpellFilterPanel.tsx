
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  return (
    <div className="filter-panel space-y-6 py-2">
      <div className="flex justify-between items-center">
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
      
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="py-2">Основные фильтры</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Уровни */}
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
                        <div className="flex items-center justify-between p-2 border-b">
                          <span className="text-sm font-medium">Выберите уровни</span>
                          {activeLevel.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                allLevels.forEach(level => {
                                  if (activeLevel.includes(level)) {
                                    toggleLevel(level);
                                  }
                                });
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              Снять все
                            </Button>
                          )}
                        </div>
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
              
              {/* Школы */}
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
                        <div className="flex items-center justify-between p-2 border-b">
                          <span className="text-sm font-medium">Выберите школы</span>
                          {activeSchool.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                allSchools.forEach(school => {
                                  if (activeSchool.includes(school)) {
                                    toggleSchool(school);
                                  }
                                });
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              Снять все
                            </Button>
                          )}
                        </div>
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
              
              {/* Классы */}
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
                        <div className="flex items-center justify-between p-2 border-b">
                          <span className="text-sm font-medium">Выберите классы</span>
                          {activeClass.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                allClasses.forEach(cls => {
                                  if (activeClass.includes(cls)) {
                                    toggleClass(cls);
                                  }
                                });
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              Снять все
                            </Button>
                          )}
                        </div>
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
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="py-2">Дополнительные фильтры</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Label htmlFor="ritual-toggle" className="font-medium mb-1">Только ритуальные</Label>
                  <span className="text-xs text-muted-foreground">Показывать только заклинания с тегом "ритуал"</span>
                </div>
                <Switch 
                  id="ritual-toggle"
                  checked={isRitualOnly}
                  onCheckedChange={toggleRitualOnly}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Label htmlFor="concentration-toggle" className="font-medium mb-1">Только с концентрацией</Label>
                  <span className="text-xs text-muted-foreground">Показывать только заклинания, требующие концентрации</span>
                </div>
                <Switch 
                  id="concentration-toggle"
                  checked={isConcentrationOnly}
                  onCheckedChange={toggleConcentrationOnly}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || isRitualOnly || isConcentrationOnly) && (
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
              
              {isRitualOnly && (
                <Badge
                  variant="outline"
                  className="flex items-center border-purple-400 text-purple-400"
                >
                  Ритуал
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={toggleRitualOnly}
                  />
                </Badge>
              )}
              
              {isConcentrationOnly && (
                <Badge
                  variant="outline"
                  className="flex items-center border-blue-400 text-blue-400"
                >
                  Концентрация
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={toggleConcentrationOnly}
                  />
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpellFilterPanel;
