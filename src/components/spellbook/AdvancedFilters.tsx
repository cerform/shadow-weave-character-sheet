
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Clock, MapPin, Timer, Book, Volume2, Hand, Package } from 'lucide-react';

interface AdvancedFiltersProps {
  verbalComponent: boolean | null;
  somaticComponent: boolean | null;
  materialComponent: boolean | null;
  setVerbalComponent: (value: boolean | null) => void;
  setSomaticComponent: (value: boolean | null) => void;
  setMaterialComponent: (value: boolean | null) => void;
  castingTimes: string[];
  activeCastingTimes: string[];
  toggleCastingTime: (time: string) => void;
  rangeTypes: string[];
  activeRangeTypes: string[];
  toggleRangeType: (range: string) => void;
  durationTypes: string[];
  activeDurationTypes: string[];
  toggleDurationType: (duration: string) => void;
  sources: string[];
  activeSources: string[];
  toggleSource: (source: string) => void;
  clearAdvancedFilters: () => void;
}

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
  const castingTimeLabels = {
    'action': 'Действие',
    'bonus': 'Бонусное действие',
    'reaction': 'Реакция',
    'minute': 'Минуты',
    'hour': 'Часы'
  };

  const rangeTypeLabels = {
    'self': 'На себя',
    'touch': 'Касание',
    'short': 'Ближняя (до 60 фт)',
    'medium': 'Средняя (60-150 фт)',
    'long': 'Дальняя (150+ фт)'
  };

  const durationTypeLabels = {
    'instant': 'Мгновенная',
    'round': 'Раунды',
    'minute': 'Минуты',
    'hour': 'Часы',
    'day': 'Дни',
    'permanent': 'Постоянная'
  };

  return (
    <div className="space-y-6">
      {/* Компоненты заклинаний */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <Volume2 className="w-4 h-4 mr-2" />
          Компоненты заклинаний
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Вербальный (В)</span>
            </Label>
            <div className="flex space-x-1">
              <Button
                variant={verbalComponent === true ? "default" : "outline"}
                size="sm"
                onClick={() => setVerbalComponent(verbalComponent === true ? null : true)}
              >
                Да
              </Button>
              <Button
                variant={verbalComponent === false ? "default" : "outline"}
                size="sm"
                onClick={() => setVerbalComponent(verbalComponent === false ? null : false)}
              >
                Нет
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Hand className="w-4 h-4" />
              <span>Соматический (С)</span>
            </Label>
            <div className="flex space-x-1">
              <Button
                variant={somaticComponent === true ? "default" : "outline"}
                size="sm"
                onClick={() => setSomaticComponent(somaticComponent === true ? null : true)}
              >
                Да
              </Button>
              <Button
                variant={somaticComponent === false ? "default" : "outline"}
                size="sm"
                onClick={() => setSomaticComponent(somaticComponent === false ? null : false)}
              >
                Нет
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Материальный (М)</span>
            </Label>
            <div className="flex space-x-1">
              <Button
                variant={materialComponent === true ? "default" : "outline"}
                size="sm"
                onClick={() => setMaterialComponent(materialComponent === true ? null : true)}
              >
                Да
              </Button>
              <Button
                variant={materialComponent === false ? "default" : "outline"}
                size="sm"
                onClick={() => setMaterialComponent(materialComponent === false ? null : false)}
              >
                Нет
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Время накладывания */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Время накладывания
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {castingTimes.map((time) => {
            const isActive = activeCastingTimes.includes(time);
            const label = castingTimeLabels[time as keyof typeof castingTimeLabels] || time;
            return (
              <Button
                key={`casting-time-${time}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCastingTime(time)}
                className="justify-start"
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Дистанция */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Дистанция
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {rangeTypes.map((range) => {
            const isActive = activeRangeTypes.includes(range);
            const label = rangeTypeLabels[range as keyof typeof rangeTypeLabels] || range;
            return (
              <Button
                key={`range-${range}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRangeType(range)}
                className="justify-start"
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Длительность */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <Timer className="w-4 h-4 mr-2" />
          Длительность
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {durationTypes.map((duration) => {
            const isActive = activeDurationTypes.includes(duration);
            const label = durationTypeLabels[duration as keyof typeof durationTypeLabels] || duration;
            return (
              <Button
                key={`duration-${duration}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDurationType(duration)}
                className="justify-start"
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Источники */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <Book className="w-4 h-4 mr-2" />
          Источники
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {sources.map((source) => {
            const isActive = activeSources.includes(source);
            return (
              <Button
                key={`source-${source}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSource(source)}
              >
                {source}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Кнопка сброса расширенных фильтров */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={clearAdvancedFilters}
      >
        <X className="w-4 h-4 mr-2" />
        Сбросить расширенные фильтры
      </Button>

      {/* Индикатор активных расширенных фильтров */}
      {(verbalComponent !== null || somaticComponent !== null || materialComponent !== null || 
        activeCastingTimes.length > 0 || activeRangeTypes.length > 0 || 
        activeDurationTypes.length > 0 || activeSources.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {verbalComponent !== null && (
            <Badge variant="outline" className="border-green-400 text-green-400">
              В: {verbalComponent ? 'Да' : 'Нет'}
            </Badge>
          )}
          {somaticComponent !== null && (
            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
              С: {somaticComponent ? 'Да' : 'Нет'}
            </Badge>
          )}
          {materialComponent !== null && (
            <Badge variant="outline" className="border-orange-400 text-orange-400">
              М: {materialComponent ? 'Да' : 'Нет'}
            </Badge>
          )}
          {activeCastingTimes.length > 0 && (
            <Badge variant="outline">
              Время: {activeCastingTimes.length}
            </Badge>
          )}
          {activeRangeTypes.length > 0 && (
            <Badge variant="outline">
              Дистанция: {activeRangeTypes.length}
            </Badge>
          )}
          {activeDurationTypes.length > 0 && (
            <Badge variant="outline">
              Длительность: {activeDurationTypes.length}
            </Badge>
          )}
          {activeSources.length > 0 && (
            <Badge variant="outline">
              Источников: {activeSources.length}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
