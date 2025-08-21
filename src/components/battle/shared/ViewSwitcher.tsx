// Переключатель режимов просмотра
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { Eye, EyeOff, Crown, Users } from 'lucide-react';

export const ViewSwitcher: React.FC = () => {
  const { viewMode, isDM, setViewMode, setIsDM } = useUnifiedBattleStore();

  return (
    <Card className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Режим:</span>
            </div>
            <Badge variant={isDM ? 'default' : 'secondary'}>
              {isDM ? 'ДМ' : 'Игрок'}
            </Badge>
          </div>
          
          <div className="h-4 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Вид:</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'dm' ? 'default' : 'outline'}
                onClick={() => setViewMode('dm')}
                className="h-7 px-2 text-xs"
              >
                <Crown className="w-3 h-3 mr-1" />
                ДМ
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'player' ? 'default' : 'outline'}
                onClick={() => setViewMode('player')}
                className="h-7 px-2 text-xs"
              >
                <Users className="w-3 h-3 mr-1" />
                Игрок
              </Button>
            </div>
          </div>
          
          <div className="h-4 w-px bg-border" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDM(!isDM)}
            className="h-7 px-2 text-xs"
          >
            {isDM ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};