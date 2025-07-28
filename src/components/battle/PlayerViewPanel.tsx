import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users } from 'lucide-react';
import { BattleToken } from '@/services/socket';

interface PlayerViewPanelProps {
  tokens: BattleToken[];
  showPlayerView: boolean;
  mapBackground?: string | null;
}

const PlayerViewPanel: React.FC<PlayerViewPanelProps> = ({ 
  tokens, 
  showPlayerView,
  mapBackground 
}) => {
  if (!showPlayerView) return null;

  // Для демонстрации - покажем только игроков и видимых монстров
  const visibleTokens = tokens.filter(token => 
    token.type === 'player' || (token.type === 'monster' && Math.random() > 0.5)
  );

  return (
    <Card className="h-[200px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Вид игрока
          <Badge variant="secondary" className="text-xs">
            Видно: {visibleTokens.length}/{tokens.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="relative w-full h-[120px] border rounded bg-muted/20 overflow-hidden"
          style={{ 
            backgroundImage: mapBackground ? `url(${mapBackground})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Туман войны - серые области */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/70 via-transparent to-gray-600/70 pointer-events-none" />
          
          {/* Видимые токены (уменьшенные) */}
          {visibleTokens.map(token => (
            <div
              key={`preview-${token.id}`}
              className="absolute w-3 h-3 rounded-full border border-white/50"
              style={{
                backgroundColor: token.color,
                left: `${(token.x / 800) * 100}%`,
                top: `${(token.y / 600) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              title={token.name}
            />
          ))}
          
          {/* Области освещения (круги) */}
          {visibleTokens.filter(t => t.type === 'player').map(token => (
            <div
              key={`light-${token.id}`}
              className="absolute rounded-full bg-yellow-200/20 border border-yellow-300/30"
              style={{
                width: '40px',
                height: '40px',
                left: `${(token.x / 800) * 100}%`,
                top: `${(token.y / 600) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {tokens.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <div>Нет токенов</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Серые области скрыты туманом войны
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerViewPanel;