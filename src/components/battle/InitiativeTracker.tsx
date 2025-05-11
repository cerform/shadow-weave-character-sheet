
import React from 'react';
import { Token } from '@/stores/battleStore';

interface InitiativeTrackerProps {
  initiative: {
    id: number;
    tokenId: number;
    name: string;
    roll: number;
    isActive: boolean;
  }[];
  tokens: Token[];
  battleActive: boolean;
}

const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({ 
  initiative, 
  tokens, 
  battleActive 
}) => {
  return (
    <div className="initiative-tracker space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Порядок инициативы</h3>
        {battleActive && (
          <div className="text-xs font-medium bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
            Бой активен
          </div>
        )}
      </div>
      
      {initiative.length === 0 ? (
        <div className="text-center p-3 text-muted-foreground bg-muted/20 rounded-md">
          Нет данных инициативы. Начните бой для броска инициативы.
        </div>
      ) : (
        <div className="space-y-1">
          {initiative.map((item) => {
            const token = tokens.find(t => t.id === item.tokenId);
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center gap-2 p-2 rounded border
                  ${item.isActive ? 'bg-primary/20 border-primary' : 'bg-card border-transparent'}`}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-muted/30 rounded-full font-medium">
                  {item.roll}
                </div>
                
                {token && (
                  <div 
                    className="w-6 h-6 rounded-full bg-center bg-cover"
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
                )}
                
                <div className="flex-1 truncate">{item.name}</div>
                
                {item.isActive && (
                  <div className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Текущий ход
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InitiativeTracker;
