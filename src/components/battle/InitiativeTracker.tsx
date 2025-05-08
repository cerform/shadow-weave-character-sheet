
import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Token, InitiativeItem } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface InitiativeTrackerProps {
  initiative: InitiativeItem[];
  tokens: Token[];
  onNextTurn?: () => void;
  onRollInitiative?: () => void;
  onSelectToken?: (id: number | null) => void;
  isDM?: boolean;
  battleActive?: boolean;
}

const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({
  initiative,
  tokens,
  onNextTurn,
  onRollInitiative,
  onSelectToken = () => {},
  isDM = true,
  battleActive = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Порядок инициативы</h3>
        {isDM && (
          <div className="flex gap-1">
            <Button
              onClick={onRollInitiative}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <RefreshCw size={14} className="mr-1" />
              <span className="text-xs">Бросок</span>
            </Button>
            <Button
              onClick={onNextTurn}
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!battleActive}
            >
              <ArrowRight size={14} className="mr-1" />
              <span className="text-xs">Следующий</span>
            </Button>
          </div>
        )}
      </div>
      
      <Separator className="my-2" />
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {initiative.map((item) => {
            const token = tokens.find(t => t.id === item.tokenId);
            if (!token) return null;
            
            return (
              <div 
                key={item.id}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  item.isActive ? 'bg-primary/20 border border-primary' : 'bg-muted/10 border'
                }`}
                onClick={() => onSelectToken?.(token.id)}
              >
                <div className="mr-2 w-6 h-6 flex items-center justify-center rounded-full bg-muted font-medium text-xs">
                  {item.roll}
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-6 h-6 rounded-full overflow-hidden bg-center bg-cover"
                    style={{backgroundImage: `url(${token.img})`}}
                  />
                  <span className="text-sm">{token.name}</span>
                </div>
                
                {item.isActive && (
                  <div className="ml-2 text-xs font-semibold text-primary">
                    Текущий ход
                  </div>
                )}
              </div>
            );
          })}
          
          {initiative.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Инициатива не была брошена
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InitiativeTracker;
