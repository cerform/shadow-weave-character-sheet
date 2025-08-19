import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Eye, EyeOff, Eraser } from 'lucide-react';
import { useFogManager } from '@/hooks/useFogManager';

interface FogControls3DProps {
  sessionId: string;
  mapId: string;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  className?: string;
}

export const FogControls3D: React.FC<FogControls3DProps> = ({
  sessionId,
  mapId,
  enabled,
  onToggleEnabled,
  className
}) => {
  const { revealAll, hideAll } = useFogManager({
    mapSize: 50,
    cellSize: 1,
    sessionId,
    mapId
  });

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="w-5 h-5" />
          Туман войны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основной переключатель */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Включить туман</span>
          <Button
            onClick={() => onToggleEnabled(!enabled)}
            variant={enabled ? "default" : "outline"}
            size="sm"
            className="min-w-[80px]"
          >
            {enabled ? 'ВКЛ' : 'ВЫКЛ'}
          </Button>
        </div>

        {enabled && (
          <>
            {/* Инструкции */}
            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
              <div className="font-medium text-muted-foreground">Управление:</div>
              <div>• <kbd className="px-1 bg-background rounded">Shift</kbd> + клик - открыть область</div>
              <div>• <kbd className="px-1 bg-background rounded">Alt</kbd> + клик - скрыть область</div>
            </div>

            {/* Быстрые действия */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Быстрые действия:</div>
              <div className="flex gap-2">
                <Button
                  onClick={revealAll}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Открыть всё
                </Button>
                <Button
                  onClick={hideAll}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Скрыть всё
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};