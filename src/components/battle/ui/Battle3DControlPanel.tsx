import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { 
  Navigation, 
  User, 
  Cloud, 
  Box, 
  Camera,
  Hand,
  Eye,
  EyeOff,
  Keyboard
} from 'lucide-react';

export const Battle3DControlPanel: React.FC = () => {
  const { currentMode, setMode, keysPressed } = useBattle3DControlStore();
  const { fogSettings } = useFogOfWarStore();

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'navigation': return Navigation;
      case 'token': return User;
      case 'fog': return Cloud;
      case 'asset': return Box;
      default: return Navigation;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'navigation': return 'bg-primary';
      case 'token': return 'bg-blue-600';
      case 'fog': return 'bg-purple-600';
      case 'asset': return 'bg-orange-600';
      default: return 'bg-primary';
    }
  };

  const getSpecialModeInfo = () => {
    if (keysPressed.shift && fogSettings.enabled) {
      return { icon: Eye, text: 'Открыть туман', color: 'bg-green-600' };
    }
    if (keysPressed.alt && fogSettings.enabled) {
      return { icon: EyeOff, text: 'Скрыть туман', color: 'bg-red-600' };
    }
    if (keysPressed.ctrl) {
      return { icon: Hand, text: 'Переместить туман', color: 'bg-blue-600' };
    }
    if (keysPressed.space) {
      return { icon: Camera, text: 'Навигация камеры', color: 'bg-purple-600' };
    }
    return null;
  };

  const specialMode = getSpecialModeInfo();

  return (
    <Card className="fixed bottom-4 left-4 z-[60] w-80 bg-background/95 backdrop-blur-sm border-border shadow-lg">
      <CardContent className="p-3 space-y-3">
        {/* Текущий режим */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Текущий режим</h3>
          {specialMode ? (
            <div className={`${specialMode.color} text-white px-2 py-1.5 rounded-md flex items-center gap-1.5 text-sm`}>
              <specialMode.icon className="w-3 h-3" />
              <span className="font-medium">{specialMode.text}</span>
            </div>
          ) : (
            <div className={`${getModeColor(currentMode)} text-white px-2 py-1.5 rounded-md flex items-center gap-1.5 text-sm`}>
              {React.createElement(getModeIcon(currentMode), { className: "w-3 h-3" })}
              <span className="text-sm font-medium">
                {currentMode === 'navigation' && 'Навигация'}
                {currentMode === 'token' && 'Управление токенами'}
                {currentMode === 'fog' && 'Туман войны'}
                {currentMode === 'asset' && 'Управление ассетами'}
              </span>
            </div>
          )}
        </div>

        {/* Кнопки переключения режимов */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Режимы управления</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant={currentMode === 'navigation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('navigation')}
              className="flex items-center gap-1.5 h-8 text-xs"
            >
              <Navigation className="w-3 h-3" />
              <span className="text-xs">Навигация</span>
            </Button>
            
            <Button
              variant={currentMode === 'token' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('token')}
              className="flex items-center gap-1.5 h-8 text-xs"
            >
              <User className="w-3 h-3" />
              <span className="text-xs">Токены</span>
            </Button>
            
            {fogSettings.enabled && (
              <Button
                variant={currentMode === 'fog' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('fog')}
                className="flex items-center gap-1.5 h-8 text-xs"
              >
                <Cloud className="w-3 h-3" />
                <span className="text-xs">Туман</span>
              </Button>
            )}
            
            <Button
              variant={currentMode === 'asset' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('asset')}
              className="flex items-center gap-1.5 h-8 text-xs"
            >
              <Box className="w-3 h-3" />
              <span className="text-xs">Ассеты</span>
            </Button>
          </div>
        </div>

        {/* Горячие клавиши */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Keyboard className="w-3 h-3" />
            Горячие клавиши
          </h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">1</kbd> Навигация</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">2</kbd> Токены</span>
            </div>
            {fogSettings.enabled && (
              <div className="flex justify-between">
                <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">3</kbd> Туман</span>
                <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">4</kbd> Ассеты</span>
              </div>
            )}
            <div className="border-t pt-1 mt-2">
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift</kbd> Открыть туман</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Alt</kbd> Скрыть туман</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> Переместить туман</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> Камера</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> Сброс</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};