
import React from 'react';
import { Token } from '@/stores/battleStore';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TokensPanelProps {
  tokens: Token[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  onRemoveToken: (id: number) => void;
}

const TokensPanel: React.FC<TokensPanelProps> = ({
  tokens,
  selectedTokenId,
  onSelectToken,
  onRemoveToken
}) => {
  if (tokens.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground bg-muted/20 rounded-md">
        Нет доступных токенов. Добавьте токены для начала боя.
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[400px]">
      <div className="space-y-2">
        {tokens.map(token => (
          <div 
            key={token.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer
              ${selectedTokenId === token.id ? 'bg-primary/20' : 'bg-card hover:bg-primary/10'}`}
            onClick={() => onSelectToken(token.id)}
          >
            <div 
              className="w-8 h-8 rounded-full bg-center bg-cover"
              style={{ 
                backgroundImage: `url(${token.img})`,
                border: `1px solid ${
                  token.type === "boss" 
                    ? "#ff5555" 
                    : token.type === "monster" 
                    ? "#ff9955" 
                    : "#55ff55"
                }` 
              }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{token.name}</div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>HP: {token.hp}/{token.maxHp}</span>
                <span>AC: {token.ac}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive/80"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveToken(token.id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokensPanel;
