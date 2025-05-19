
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Token } from '@/stores/battleStore';

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
  return (
    <div className="tokens-panel space-y-2">
      <h3 className="font-medium">Токены на поле ({tokens.length})</h3>
      
      {tokens.length === 0 ? (
        <div className="text-center p-3 text-muted-foreground bg-muted/20 rounded-md">
          Нет активных токенов на поле
        </div>
      ) : (
        <div className="space-y-1">
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-background/50 transition-colors
                ${selectedTokenId === token.id ? 'bg-primary/20 border border-primary' : 'bg-card'}`}
              onClick={() => onSelectToken(token.id)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full bg-center bg-cover"
                  style={{ 
                    backgroundImage: `url(${token.img})`,
                    border: `2px solid ${
                      token.type === "boss" 
                        ? "#ff5555" 
                        : token.type === "monster" 
                        ? "#ff9955" 
                        : "#55ff55"
                    }` 
                  }}
                />
                <div>
                  <div className="text-sm font-medium">{token.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>HP: {token.hp}/{token.maxHp}</span>
                    <span>AC: {token.ac}</span>
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveToken(token.id);
                }}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokensPanel;
