import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpCircle, ArrowDownCircle, Plus, Trash2 } from 'lucide-react';
import { Initiative, TokenData } from '@/types/session.types';

interface InitiativeTrackerPanelProps {
  initiatives: Initiative[];
  tokens: TokenData[];
  battleActive: boolean;
  sessionId: string;
  onUpdateInitiative: (newInitiative: Initiative[]) => void;
  onToggleBattle: () => void;
  onNextTurn: () => void;
}

const InitiativeTrackerPanel: React.FC<InitiativeTrackerPanelProps> = ({
  initiatives,
  tokens,
  battleActive,
  sessionId,
  onUpdateInitiative,
  onToggleBattle,
  onNextTurn
}) => {
  const [newName, setNewName] = useState('');
  const [newInitiative, setNewInitiative] = useState<number>(10);
  const [sortedInitiatives, setSortedInitiatives] = useState<Initiative[]>([]);
  const [activeInitiativeId, setActiveInitiativeId] = useState<string | null>(null);

  // Sort initiatives when they change
  useEffect(() => {
    const sorted = [...initiatives].sort((a, b) => b.initiative - a.initiative);
    setSortedInitiatives(sorted);
    
    // Set active initiative if none is set
    if (sorted.length > 0 && !sorted.some(i => i.isActive)) {
      handleSetActive(sorted[0].id);
    }
  }, [initiatives]);

  // Add new initiative
  const handleAddInitiative = () => {
    if (!newName.trim()) return;
    
    const newEntry: Initiative = {
      id: Date.now().toString(),
      name: newName,
      initiative: newInitiative,
      isActive: false
    };
    
    onUpdateInitiative([...initiatives, newEntry]);
    setNewName('');
    setNewInitiative(10);
  };

  // Remove initiative
  const handleRemoveInitiative = (id: string) => {
    const updatedInitiatives = initiatives.filter(i => i.id !== id);
    onUpdateInitiatives(updatedInitiatives);
  };

  // Set active initiative
  const handleSetActive = (id: string) => {
    const updatedInitiatives = initiatives.map(i => ({
      ...i,
      isActive: i.id === id
    }));
    
    setActiveInitiativeId(id);
    onUpdateInitiatives(updatedInitiatives);
  };

  // Move to next initiative in order
  const handleNextInitiative = () => {
    if (sortedInitiatives.length === 0) return;
    
    const activeIndex = sortedInitiatives.findIndex(i => i.isActive);
    const nextIndex = activeIndex === sortedInitiatives.length - 1 ? 0 : activeIndex + 1;
    
    handleSetActive(sortedInitiatives[nextIndex].id);
  };

  // Move to previous initiative in order
  const handlePrevInitiative = () => {
    if (sortedInitiatives.length === 0) return;
    
    const activeIndex = sortedInitiatives.findIndex(i => i.isActive);
    const prevIndex = activeIndex <= 0 ? sortedInitiatives.length - 1 : activeIndex - 1;
    
    handleSetActive(sortedInitiatives[prevIndex].id);
  };

  // Roll initiative for all
  const handleRollAllInitiative = () => {
    const updatedInitiatives = initiatives.map(i => ({
      ...i,
      initiative: Math.floor(Math.random() * 20) + 1 // d20 roll
    }));
    
    onUpdateInitiatives(updatedInitiatives);
  };

  // Roll initiative for one
  const handleRollInitiative = (id: string) => {
    const updatedInitiatives = initiatives.map(i => {
      if (i.id === id) {
        return {
          ...i,
          initiative: Math.floor(Math.random() * 20) + 1 // d20 roll
        };
      }
      return i;
    });
    
    onUpdateInitiatives(updatedInitiatives);
  };

  // Update initiative value manually
  const handleUpdateInitiative = (id: string, value: string) => {
    const initiativeValue = parseInt(value) || 0;
    
    const updatedInitiatives = initiatives.map(i => {
      if (i.id === id) {
        return {
          ...i,
          initiative: initiativeValue
        };
      }
      return i;
    });
    
    onUpdateInitiatives(updatedInitiatives);
  };

  // Reset all initiatives
  const handleResetInitiatives = () => {
    onUpdateInitiatives([]);
  };

  // Add token to initiative
  const handleAddTokenToInitiative = (token: TokenData) => {
    if (!token || !token.name) return;
    
    const existingIndex = initiatives.findIndex(i => i.tokenId === token.id);
    
    if (existingIndex !== -1) {
      // Token already has initiative, just roll for it
      handleRollInitiative(initiatives[existingIndex].id);
      return;
    }
    
    const newEntry: Initiative = {
      id: Date.now().toString(),
      name: token.name,
      initiative: Math.floor(Math.random() * 20) + 1,
      isActive: false,
      tokenId: token.id
    };
    
    onUpdateInitiatives([...initiatives, newEntry]);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Отслеживание инициативы</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrevInitiative} title="Предыдущий участник">
              <ArrowUpCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleNextInitiative} title="Следующий участник">
              <ArrowDownCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleRollAllInitiative} title="Перебросить все">
              d20
            </Button>
            <Button size="sm" variant="destructive" onClick={handleResetInitiatives} title="Очистить">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
        {/* Initiative list */}
        <div className="flex-1 overflow-y-auto">
          {sortedInitiatives.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Добавьте участников боя, чтобы отслеживать инициативу
            </div>
          ) : (
            <div className="space-y-2">
              {sortedInitiatives.map((init) => (
                <div 
                  key={init.id} 
                  className={`flex items-center justify-between p-2 rounded-md ${
                    init.isActive ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/10'
                  }`}
                  onClick={() => handleSetActive(init.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{init.name}</div>
                    {init.tokenId && (
                      <div className="text-xs text-muted-foreground">(Токен)</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={init.initiative}
                      onChange={(e) => handleUpdateInitiative(init.id, e.target.value)}
                      className="w-16 text-center"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveInitiative(init.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add new initiative form */}
        <div className="border-t pt-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="name">Имя участника</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Имя"
              />
            </div>
            <div className="w-20">
              <Label htmlFor="initiative">Инициатива</Label>
              <Input
                id="initiative"
                type="number"
                value={newInitiative}
                onChange={(e) => setNewInitiative(parseInt(e.target.value) || 0)}
              />
            </div>
            <Button onClick={handleAddInitiative} disabled={!newName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InitiativeTrackerPanel;
