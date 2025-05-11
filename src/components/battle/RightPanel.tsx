
import React from 'react';
import { Button } from '@/components/ui/button';
import { createToken } from '@/utils/tokenHelpers';
import { Token } from '@/types/battle';

interface RightPanelProps {
  selectedToken: Token | null;
  onUpdateToken: (id: number, updates: Partial<Token>) => void;
  onRemoveToken: (id: number) => void;
  onAddPlayerToken: (token: Omit<Token, 'id'>) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedToken,
  onUpdateToken,
  onRemoveToken,
  onAddPlayerToken,
}) => {
  const handleUpdateHp = (change: number) => {
    if (!selectedToken) return;
    
    const newHp = Math.max(0, Math.min((selectedToken.hp || 0) + change, selectedToken.maxHp || 0));
    onUpdateToken(selectedToken.id, { hp: newHp });
  };
  
  const handleAddPlayerToken = () => {
    const newToken: Omit<Token, 'id'> = createToken('player', 'Adventurer', {
      img: '/assets/players/adventurer.png',
      x: 200,
      y: 200,
      hp: 30,
      maxHp: 30,
      ac: 15,
      initiative: Math.floor(Math.random() * 20) + 1,
      conditions: [],
      resources: {},
      visible: true,
      isVisible: true,
      size: 'medium',
    });
    
    onAddPlayerToken(newToken);
  };
  
  return (
    <div className="p-4 border-l h-full">
      <h2 className="text-xl font-bold mb-4">Token Details</h2>
      
      {selectedToken ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedToken.img}
              alt={selectedToken.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h3 className="font-bold">{selectedToken.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{selectedToken.type}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">HP</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleUpdateHp(-1)}>-</Button>
                <span>{selectedToken.hp} / {selectedToken.maxHp}</span>
                <Button size="sm" variant="outline" onClick={() => handleUpdateHp(1)}>+</Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">AC</p>
              <p className="font-bold">{selectedToken.ac}</p>
            </div>
          </div>
          
          <Button variant="destructive" onClick={() => onRemoveToken(selectedToken.id)}>
            Remove Token
          </Button>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No token selected</p>
          <Button className="mt-4" onClick={handleAddPlayerToken}>Add Player Token</Button>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
