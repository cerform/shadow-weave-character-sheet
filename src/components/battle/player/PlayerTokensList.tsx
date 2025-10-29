import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Heart, Shield } from 'lucide-react';
import { EnhancedToken } from '@/stores/enhancedBattleStore';

interface PlayerTokensListProps {
  tokens: EnhancedToken[];
  currentToken?: EnhancedToken;
  onTokenSelect?: (token: EnhancedToken) => void;
}

export const PlayerTokensList: React.FC<PlayerTokensListProps> = ({
  tokens,
  currentToken,
  onTokenSelect
}) => {
  const playerTokens = tokens.filter(t => !t.isEnemy);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Группа ({playerTokens.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {playerTokens.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            Нет персонажей в группе
          </div>
        ) : (
          playerTokens.map((token) => {
            const hpPercent = (token.hp / token.maxHp) * 100;
            const isSelected = currentToken?.id === token.id;
            const isSummoned = token.is_summoned;

            return (
              <div
                key={token.id}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
                onClick={() => onTokenSelect?.(token)}
              >
                <div className="flex items-center gap-2">
                  {/* Аватар */}
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={token.image_url || token.avatarUrl} alt={token.name} />
                    <AvatarFallback className="text-xs">
                      {token.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {token.name}
                      </span>
                      {isSummoned && (
                        <Badge variant="secondary" className="text-xs">
                          Призыв
                        </Badge>
                      )}
                      {token.initiative !== undefined && (
                        <Badge variant="outline" className="text-xs ml-auto">
                          Ини: {token.initiative}
                        </Badge>
                      )}
                    </div>

                    {/* HP бар */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="font-mono">{token.hp}/{token.maxHp}</span>
                        <Shield className="h-3 w-3 text-blue-500 ml-auto" />
                        <span className="font-mono">{token.ac}</span>
                      </div>
                      <Progress value={hpPercent} className="h-1" />
                    </div>

                    {/* Состояния */}
                    {token.conditions && token.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {token.conditions.map((condition, idx) => (
                          <Badge 
                            key={idx} 
                            variant="destructive" 
                            className="text-xs py-0 px-1"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
