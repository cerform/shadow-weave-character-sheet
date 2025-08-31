import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Users, Crown } from 'lucide-react';
import { useSessionSync } from '@/hooks/useSessionSync';

interface SessionStatusProps {
  sessionId: string;
  isDM?: boolean;
  className?: string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({
  sessionId,
  isDM = false,
  className = ""
}) => {
  const { sessionState, loading } = useSessionSync(sessionId);

  if (loading) {
    return (
      <Card className={`bg-background/90 backdrop-blur-sm ${className}`}>
        <CardContent className="py-4">
          <div className="animate-pulse text-xs text-muted-foreground">
            Загрузка состояния сессии...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-background/90 backdrop-blur-sm ${className}`}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          {isDM ? (
            <>
              <Crown className="h-4 w-4 text-yellow-500" />
              Панель ДМ
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              Статус сессии
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-2 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Карта:</div>
            <div className={`px-2 py-1 rounded text-xs ${
              sessionState?.current_map_url 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {sessionState?.current_map_url ? 'Загружена' : 'Не загружена'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Туман:</div>
            <div className={`px-2 py-1 rounded text-xs ${
              sessionState?.fog_enabled 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {sessionState?.fog_enabled ? 'Включен' : 'Выключен'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Сетка:</div>
            <div className={`px-2 py-1 rounded text-xs ${
              sessionState?.grid_visible 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {sessionState?.grid_visible ? 'Видима' : 'Скрыта'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Масштаб:</div>
            <div className="px-2 py-1 rounded text-xs bg-accent/20 text-accent-foreground">
              {sessionState?.map_scale || 100}%
            </div>
          </div>
        </div>

        {isDM && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Вы управляете сессией
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                <Eye className="h-3 w-3 mr-1" />
                Вид игрока
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};