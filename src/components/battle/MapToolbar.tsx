
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  Grid,
  Plus,
  Minus,
  Move,
  RotateCcw,
  Save,
  Download,
  Copy,
  Trash,
  Lightbulb,
  Dices,
} from 'lucide-react';

interface MapToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onMoveMap: (direction: 'up' | 'down' | 'left' | 'right') => void;
  gridVisible: boolean;
  gridOpacity: number;
  onToggleGrid: () => void;
  onSetGridOpacity: (value: number) => void;
  fogOfWar: boolean;
  revealRadius: number;
  onToggleFog: () => void;
  onResetFog: () => void;
  onSetRevealRadius: (value: number) => void;
  isDM: boolean;
  onToggleDMMode: () => void;
  onSaveMap?: () => void;
  onLoadMap?: () => void;
  onAddAreaEffect?: (type: 'circle' | 'cone' | 'square' | 'line') => void;
  onAddLight?: (type: 'torch' | 'lantern' | 'daylight') => void;
  onDuplicateToken?: () => void;
  onDeleteToken?: () => void;
  variant?: 'compact' | 'full';
}

const MapToolbar: React.FC<MapToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onMoveMap,
  gridVisible,
  gridOpacity,
  onToggleGrid,
  onSetGridOpacity,
  fogOfWar,
  revealRadius,
  onToggleFog,
  onResetFog,
  onSetRevealRadius,
  isDM,
  onToggleDMMode,
  onSaveMap,
  onLoadMap,
  onAddAreaEffect,
  onAddLight,
  onDuplicateToken,
  onDeleteToken,
  variant = 'full'
}) => {
  // Для отображения состояния режимов
  const [activeAreaEffect, setActiveAreaEffect] = useState<'circle' | 'cone' | 'square' | 'line' | null>(null);
  
  // Стиль для компактного режима
  const isCompact = variant === 'compact';
  
  // Группы кнопок для удобного условного рендеринга
  const zoomButtons = (
    <div className="flex space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onZoomIn}>
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Приблизить</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onZoomOut}>
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Отдалить</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Сбросить масштаб</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  
  const navigationButtons = (
    <div className="grid grid-cols-3 gap-1">
      <div></div>
      <Button variant="outline" size="icon" onClick={() => onMoveMap('up')}>
        <Move className="h-4 w-4 rotate-0" />
      </Button>
      <div></div>
      <Button variant="outline" size="icon" onClick={() => onMoveMap('left')}>
        <Move className="h-4 w-4 -rotate-90" />
      </Button>
      <div className="flex items-center justify-center text-xs">
        <span>{Math.round(zoom * 100)}%</span>
      </div>
      <Button variant="outline" size="icon" onClick={() => onMoveMap('right')}>
        <Move className="h-4 w-4 rotate-90" />
      </Button>
      <div></div>
      <Button variant="outline" size="icon" onClick={() => onMoveMap('down')}>
        <Move className="h-4 w-4 rotate-180" />
      </Button>
      <div></div>
    </div>
  );
  
  const gridControls = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={gridVisible ? "default" : "outline"} size="icon">
          <Grid className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Показать сетку</Label>
            <Button variant="ghost" size="sm" onClick={onToggleGrid}>
              {gridVisible ? 'Скрыть' : 'Показать'}
            </Button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label>Прозрачность сетки</Label>
              <span className="text-xs">{Math.round(gridOpacity * 100)}%</span>
            </div>
            <Slider
              value={[gridOpacity]}
              min={0.1}
              max={1}
              step={0.1}
              onValueChange={(value) => onSetGridOpacity(value[0])}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
  
  const fogControls = isDM && (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={fogOfWar ? "default" : "outline"} size="icon">
          {fogOfWar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Туман войны</Label>
            <Button variant="ghost" size="sm" onClick={onToggleFog}>
              {fogOfWar ? 'Выключить' : 'Включить'}
            </Button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label>Радиус открытия</Label>
              <span className="text-xs">{revealRadius} ячеек</span>
            </div>
            <Slider
              value={[revealRadius]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => onSetRevealRadius(value[0])}
            />
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onResetFog}>
            Сбросить туман
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
  
  // Новые элементы управления для эффектов области
  const areaEffectControls = isDM && onAddAreaEffect && (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={activeAreaEffect ? "default" : "outline"} 
          size="icon"
          className="relative"
        >
          <Dices className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <Label>Эффекты области</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveAreaEffect('circle');
                onAddAreaEffect('circle');
              }}
            >
              Круг
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveAreaEffect('cone');
                onAddAreaEffect('cone');
              }}
            >
              Конус
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveAreaEffect('square');
                onAddAreaEffect('square');
              }}
            >
              Квадрат
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveAreaEffect('line');
                onAddAreaEffect('line');
              }}
            >
              Линия
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
  
  // Новые элементы управления для эффектов освещения
  const lightingControls = isDM && onAddLight && (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <Label>Источники света</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddLight('torch')}
            >
              Факел (малый радиус)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddLight('lantern')}
            >
              Фонарь (средний радиус)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddLight('daylight')}
            >
              Дневной свет (весь экран)
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
  
  // Кнопки дублирования и удаления токенов
  const tokenControls = isDM && (
    <div className="flex space-x-1">
      {onDuplicateToken && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onDuplicateToken}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Дублировать токен (Ctrl+D)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {onDeleteToken && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onDeleteToken}
                className="text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Удалить токен</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
  
  // Кнопки сохранения и загрузки карты
  const saveLoadControls = isDM && (
    <div className="flex space-x-1">
      {onSaveMap && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onSaveMap}
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Сохранить карту</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {onLoadMap && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onLoadMap}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Загрузить карту</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
  
  // Возвращаем обертку с соответствующим набором компонентов
  return (
    <div className={`p-2 flex ${isCompact ? 'flex-col' : 'flex-wrap'} gap-2`}>
      {zoomButtons}
      {!isCompact && navigationButtons}
      {gridControls}
      {fogControls}
      {areaEffectControls}
      {lightingControls}
      {tokenControls}
      {saveLoadControls}
    </div>
  );
};

export default MapToolbar;
