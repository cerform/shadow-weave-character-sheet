
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Check, Filter, Clock, Move, Hourglass, BookMarked } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface AdvancedFiltersProps {
  // Компоненты
  verbalComponent: boolean | null;
  somaticComponent: boolean | null;
  materialComponent: boolean | null;
  setVerbalComponent: (value: boolean | null) => void;
  setSomaticComponent: (value: boolean | null) => void;
  setMaterialComponent: (value: boolean | null) => void;
  
  // Время накладывания
  castingTimes: string[];
  activeCastingTimes: string[];
  toggleCastingTime: (time: string) => void;
  
  // Дистанция
  rangeTypes: string[];
  activeRangeTypes: string[];
  toggleRangeType: (range: string) => void;
  
  // Длительность
  durationTypes: string[];
  activeDurationTypes: string[];
  toggleDurationType: (duration: string) => void;
  
  // Источники
  sources: string[];
  activeSources: string[];
  toggleSource: (source: string) => void;
  
  // Сброс фильтров
  clearAdvancedFilters: () => void;
}

// Функция для перевода названий фильтров
const translateFilterLabel = (key: string): string => {
  const translations: Record<string, string> = {
    // Время накладывания
    'action': 'Действие',
    'bonus': 'Бонусное действие',
    'reaction': 'Реакция',
    'minute': 'Минуты',
    'hour': 'Часы',
    
    // Дистанция
    'self': 'На себя',
    'touch': 'Касание',
    'short': 'Ближняя (до 60 футов)',
    'medium': 'Средняя (до 150 футов)',
    'long': 'Дальняя (300+ футов)',
    
    // Длительность
    'instant': 'Мгновенная',
    'round': 'Раунды',
    'day': 'Дни',
    'permanent': 'Постоянная',
    
    // Источники
    'PHB': 'Книга игрока',
    'XGE': 'Руководство Занатара',
    'TCE': 'Котёл Таши',
    'SCAG': 'Путеводитель по Побережью Меча',
    'EE': 'Стихийное зло',
    'AI': 'Приключения в Забытых Королевствах',
    'WGE': 'Путеводитель Хозяина по Эберрону',
    'IDRotF': 'Иссилден: Долина Ледяного Ветра',
    'FTD': 'Сокровищница Физбана',
    'SCC': 'Руководство по Сильверквилл Кампусу',
    'UA': 'Unearthed Arcana',
    'HB': 'Homebrew'
  };
  
  return translations[key] || key;
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  verbalComponent,
  somaticComponent,
  materialComponent,
  setVerbalComponent,
  setSomaticComponent,
  setMaterialComponent,
  castingTimes,
  activeCastingTimes,
  toggleCastingTime,
  rangeTypes,
  activeRangeTypes,
  toggleRangeType,
  durationTypes,
  activeDurationTypes,
  toggleDurationType,
  sources,
  activeSources,
  toggleSource,
  clearAdvancedFilters
}) => {
  const { themeStyles } = useTheme();
  const [activeTab, setActiveTab] = useState("components");
  
  // Получаем количество активных фильтров
  const getActiveFiltersCount = () => {
    let count = 0;
    if (verbalComponent !== null) count++;
    if (somaticComponent !== null) count++;
    if (materialComponent !== null) count++;
    count += activeCastingTimes.length;
    count += activeRangeTypes.length;
    count += activeDurationTypes.length;
    count += activeSources.length;
    return count;
  };
  
  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Filter className="mr-2 h-5 w-5" style={{ color: themeStyles?.accent }} />
          Расширенные фильтры
        </h3>
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAdvancedFilters}
            className="h-8 px-2"
          >
            Сбросить ({activeFiltersCount}) <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="components">Компоненты</TabsTrigger>
          <TabsTrigger value="casting">Сотворение</TabsTrigger>
          <TabsTrigger value="range">Дистанция</TabsTrigger>
          <TabsTrigger value="other">Прочее</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="space-y-4 py-2">
          <h4 className="text-sm font-medium mb-2">Компоненты заклинания</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="verbal-checkbox" 
                checked={verbalComponent === true}
                onCheckedChange={(checked) => {
                  if (checked === 'indeterminate') return;
                  if (verbalComponent === true) {
                    setVerbalComponent(null); // сброс фильтра
                  } else {
                    setVerbalComponent(true); // включение фильтра
                  }
                }}
              />
              <Label htmlFor="verbal-checkbox" className="cursor-pointer">Вербальный (В)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="somatic-checkbox" 
                checked={somaticComponent === true}
                onCheckedChange={(checked) => {
                  if (checked === 'indeterminate') return;
                  if (somaticComponent === true) {
                    setSomaticComponent(null); // сброс фильтра
                  } else {
                    setSomaticComponent(true); // включение фильтра
                  }
                }}
              />
              <Label htmlFor="somatic-checkbox" className="cursor-pointer">Соматический (С)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="material-checkbox" 
                checked={materialComponent === true}
                onCheckedChange={(checked) => {
                  if (checked === 'indeterminate') return;
                  if (materialComponent === true) {
                    setMaterialComponent(null); // сброс фильтра
                  } else {
                    setMaterialComponent(true); // включение фильтра
                  }
                }}
              />
              <Label htmlFor="material-checkbox" className="cursor-pointer">Материальный (М)</Label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="casting" className="space-y-4 py-2">
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" style={{ color: themeStyles?.accent }} />
              <h4 className="text-sm font-medium">Время накладывания</h4>
            </div>
            
            <ScrollArea className="h-[200px] pr-3">
              {castingTimes.map(timeType => (
                <div key={`casting-time-${timeType}`} className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id={`casting-time-${timeType}`} 
                    checked={activeCastingTimes.includes(timeType)}
                    onCheckedChange={() => toggleCastingTime(timeType)}
                  />
                  <Label 
                    htmlFor={`casting-time-${timeType}`}
                    className="cursor-pointer"
                  >
                    {translateFilterLabel(timeType)}
                  </Label>
                </div>
              ))}
            </ScrollArea>
            
            {activeCastingTimes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeCastingTimes.map(timeType => (
                  <Badge
                    key={`active-casting-${timeType}`}
                    variant="outline"
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleCastingTime(timeType)}
                  >
                    {translateFilterLabel(timeType)}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="range" className="space-y-4 py-2">
          <div className="space-y-3">
            <div className="flex items-center">
              <Move className="mr-2 h-4 w-4" style={{ color: themeStyles?.accent }} />
              <h4 className="text-sm font-medium">Дистанция</h4>
            </div>
            
            <ScrollArea className="h-[200px] pr-3">
              {rangeTypes.map(rangeType => (
                <div key={`range-type-${rangeType}`} className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id={`range-type-${rangeType}`} 
                    checked={activeRangeTypes.includes(rangeType)}
                    onCheckedChange={() => toggleRangeType(rangeType)}
                  />
                  <Label 
                    htmlFor={`range-type-${rangeType}`}
                    className="cursor-pointer"
                  >
                    {translateFilterLabel(rangeType)}
                  </Label>
                </div>
              ))}
            </ScrollArea>
            
            {activeRangeTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeRangeTypes.map(rangeType => (
                  <Badge
                    key={`active-range-${rangeType}`}
                    variant="outline"
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleRangeType(rangeType)}
                  >
                    {translateFilterLabel(rangeType)}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4 py-2">
          <div className="space-y-4">
            {/* Длительность */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Hourglass className="mr-2 h-4 w-4" style={{ color: themeStyles?.accent }} />
                <h4 className="text-sm font-medium">Длительность</h4>
              </div>
              
              <ScrollArea className="h-[100px] pr-3">
                {durationTypes.map(durationType => (
                  <div key={`duration-type-${durationType}`} className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id={`duration-type-${durationType}`} 
                      checked={activeDurationTypes.includes(durationType)}
                      onCheckedChange={() => toggleDurationType(durationType)}
                    />
                    <Label 
                      htmlFor={`duration-type-${durationType}`}
                      className="cursor-pointer"
                    >
                      {translateFilterLabel(durationType)}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
              
              {activeDurationTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeDurationTypes.map(durationType => (
                    <Badge
                      key={`active-duration-${durationType}`}
                      variant="outline"
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleDurationType(durationType)}
                    >
                      {translateFilterLabel(durationType)}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Источники */}
            <div className="space-y-3">
              <div className="flex items-center">
                <BookMarked className="mr-2 h-4 w-4" style={{ color: themeStyles?.accent }} />
                <h4 className="text-sm font-medium">Источники</h4>
              </div>
              
              <ScrollArea className="h-[100px] pr-3">
                {sources.map(source => (
                  <div key={`source-${source}`} className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id={`source-${source}`} 
                      checked={activeSources.includes(source)}
                      onCheckedChange={() => toggleSource(source)}
                    />
                    <Label 
                      htmlFor={`source-${source}`}
                      className="cursor-pointer"
                    >
                      {translateFilterLabel(source)}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
              
              {activeSources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeSources.map(source => (
                    <Badge
                      key={`active-source-${source}`}
                      variant="outline"
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSource(source)}
                    >
                      {translateFilterLabel(source)}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedFilters;
