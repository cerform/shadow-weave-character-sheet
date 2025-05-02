import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Activity, Plus, Minus, X, PlusCircle, MinusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Token, Initiative } from '@/pages/PlayBattlePage';
import { useToast } from '@/components/ui/use-toast';
import { MapControls } from './MapControls';

interface RightPanelProps {
  selectedTokenId: number | null;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  fogOfWar: boolean;
  setFogOfWar: (value: boolean) => void;
  revealRadius: number;
  setRevealRadius: (value: number) => void;
  gridVisible: boolean;
  setGridVisible: (value: boolean) => void;
  gridOpacity: number;
  setGridOpacity: (value: number) => void;
  onResetFogOfWar: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedTokenId, 
  tokens,
  setTokens,
  fogOfWar,
  setFogOfWar,
  revealRadius,
  setRevealRadius,
  gridVisible,
  setGridVisible,
  gridOpacity,
  setGridOpacity,
  onResetFogOfWar 
}) => {
  const { toast } = useToast();
  const [newCondition, setNewCondition] = useState("");
  
  // Find the selected token
  const selectedToken = tokens.find(token => token.id === selectedTokenId);
  
  // If no token selected, show map controls
  if (!selectedToken) {
    return (
      <div className="h-full w-64 p-4 border-l">
        <h3 className="font-medium mb-4">Управление картой</h3>
        <MapControls 
          fogOfWar={fogOfWar}
          setFogOfWar={setFogOfWar}
          revealRadius={revealRadius}
          setRevealRadius={setRevealRadius}
          gridVisible={gridVisible}
          setGridVisible={setGridVisible}
          gridOpacity={gridOpacity}
          setGridOpacity={setGridOpacity}
          onResetFogOfWar={onResetFogOfWar}
        />
      </div>
    );
  }
  
  // Update token hit points
  const updateHP = (change: number) => {
    setTokens(tokens.map(token => {
      if (token.id === selectedTokenId) {
        const newHP = Math.max(0, Math.min(token.maxHp, token.hp + change));
        return { ...token, hp: newHP };
      }
      return token;
    }));
    
    // Show toast for significant damage
    if (change <= -5) {
      toast({
        title: `${selectedToken.name} получает урон`,
        description: `${Math.abs(change)} урона нанесено`
      });
    }
  };
  
  // Add condition to token
  const addCondition = () => {
    if (newCondition.trim() === "") return;
    
    setTokens(tokens.map(token => {
      if (token.id === selectedTokenId) {
        // Don't add duplicate conditions
        if (token.conditions.includes(newCondition)) {
          toast({
            title: "Состояние уже существует",
            description: `${selectedToken.name} уже имеет состояние ${newCondition}`
          });
          return token;
        }
        
        return { 
          ...token, 
          conditions: [...token.conditions, newCondition]
        };
      }
      return token;
    }));
    
    setNewCondition("");
    
    toast({
      title: "Состояние добавлено",
      description: `${selectedToken.name} теперь ${newCondition}`
    });
  };
  
  // Remove condition from token
  const removeCondition = (condition: string) => {
    setTokens(tokens.map(token => {
      if (token.id === selectedTokenId) {
        return { 
          ...token, 
          conditions: token.conditions.filter(c => c !== condition) 
        };
      }
      return token;
    }));
    
    toast({
      title: "Состояние удалено",
      description: `${selectedToken.name} больше не ${condition}`
    });
  };

  // Modify resource value
  const modifyResource = (resourceName: string, change: number) => {
    setTokens(tokens.map(token => {
      if (token.id === selectedTokenId) {
        const resources = { ...token.resources };
        if (resources[resourceName] === undefined) {
          resources[resourceName] = 0;
        }
        resources[resourceName] = Math.max(0, resources[resourceName] + change);
        return { ...token, resources };
      }
      return token;
    }));
  };

  // Add new resource
  const addResource = (name: string, value: number = 0) => {
    setTokens(tokens.map(token => {
      if (token.id === selectedTokenId) {
        const resources = { ...token.resources };
        if (resources[name] === undefined) {
          resources[name] = value;
        }
        return { ...token, resources };
      }
      return token;
    }));
  };

  // Toggle token visibility
  const toggleVisibility = () => {
    setTokens(tokens.map(token => {
      if (token.id === selectedTokenId) {
        return { ...token, visible: !token.visible };
      }
      return token;
    }));
    
    toast({
      title: selectedToken.visible ? "Токен скрыт" : "Токен виден",
      description: `${selectedToken.name} теперь ${selectedToken.visible ? "не виден" : "виден"} для игроков`
    });
  };
  
  return (
    <ScrollArea className="h-full w-64 p-4 border-l">
      <div className="space-y-4">
        {/* Token Header */}
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary">
            <img src={selectedToken.img} alt={selectedToken.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{selectedToken.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{selectedToken.type}</p>
          </div>
        </div>
        
        <Separator />
        
        {/* Token Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Card className="p-1">
            <div className="flex flex-col items-center">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">{selectedToken.hp}/{selectedToken.maxHp}</span>
              <span className="text-xs text-muted-foreground">HP</span>
            </div>
          </Card>
          <Card className="p-1">
            <div className="flex flex-col items-center">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{selectedToken.ac}</span>
              <span className="text-xs text-muted-foreground">AC</span>
            </div>
          </Card>
          <Card className="p-1">
            <div className="flex flex-col items-center">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{selectedToken.initiative}</span>
              <span className="text-xs text-muted-foreground">INIT</span>
            </div>
          </Card>
        </div>
        
        {/* HP Controls */}
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" /> Здоровье
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-4 gap-2">
              <Button size="sm" variant="outline" onClick={() => updateHP(-1)}>-1</Button>
              <Button size="sm" variant="outline" onClick={() => updateHP(1)}>+1</Button>
              <Button size="sm" variant="outline" onClick={() => updateHP(-5)}>-5</Button>
              <Button size="sm" variant="outline" onClick={() => updateHP(5)}>+5</Button>
            </div>
            <div className="flex items-center mt-2">
              <Button size="sm" variant="destructive" className="w-full" onClick={() => updateHP(-selectedToken.hp)}>
                <Minus className="h-3 w-3 mr-1" /> Нокаут
              </Button>
              <Button size="sm" variant="default" className="w-full ml-2" onClick={() => updateHP(selectedToken.maxHp - selectedToken.hp)}>
                <Plus className="h-3 w-3 mr-1" /> Полное
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Conditions */}
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Состояния</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedToken.conditions.length === 0 ? (
                <div className="text-xs text-muted-foreground">Нет активных состояний</div>
              ) : (
                selectedToken.conditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="flex items-center">
                    {condition}
                    <button 
                      className="ml-1 hover:bg-muted rounded-full" 
                      onClick={() => removeCondition(condition)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <div className="flex mt-2">
              <Input 
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Новое состояние..."
                className="text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addCondition()}
              />
              <Button size="sm" onClick={addCondition} className="ml-2">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Resources */}
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Ресурсы</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {Object.keys(selectedToken.resources).length === 0 ? (
              <div className="text-xs text-muted-foreground">Нет активных ресурсов</div>
            ) : (
              <div className="space-y-2">
                {Object.keys(selectedToken.resources).map(resourceName => (
                  <div key={resourceName} className="flex items-center justify-between">
                    <span className="text-sm">{resourceName}</span>
                    <div className="flex items-center">
                      <Button size="icon" variant="ghost" className="h-6 w-6 p-0" onClick={() => modifyResource(resourceName, -1)}>
                        <MinusCircle className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 text-sm">{selectedToken.resources[resourceName]}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 p-0" onClick={() => modifyResource(resourceName, 1)}>
                        <PlusCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button size="sm" variant="outline" className="mt-2 w-full">
              <Plus className="h-3 w-3 mr-1" /> Добавить ресурс
            </Button>
          </CardContent>
        </Card>
        
        {/* Visibility Toggle */}
        <Button variant="outline" className="w-full" onClick={toggleVisibility}>
          {selectedToken.visible ? "Скрыть от игроков" : "Показать игрокам"}
        </Button>
      </div>
    </ScrollArea>
  );
};

export default RightPanel;
