
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, LucideSun, Grid3x3, Eye, EyeOff, Layers, Plus, X, ZoomIn, ZoomOut, Scale } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3DFixed";
import { Token } from "@/pages/PlayBattlePage";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface RightPanelProps {
  selectedTokenId: number | null;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  fogOfWar: boolean;
  setFogOfWar: React.Dispatch<React.SetStateAction<boolean>>;
  revealRadius: number;
  setRevealRadius: React.Dispatch<React.SetStateAction<number>>;
  gridVisible: boolean;
  setGridVisible: React.Dispatch<React.SetStateAction<boolean>>;
  gridOpacity: number;
  setGridOpacity: React.Dispatch<React.SetStateAction<number>>;
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
  onResetFogOfWar,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [activeTab, setActiveTab] = useState("stats");

  const selectedToken = tokens.find(token => token.id === selectedTokenId);

  const handleUpdateTokenHP = (change: number) => {
    if (!selectedToken) return;
    
    setTokens(prev => prev.map(token => 
      token.id === selectedTokenId 
        ? {...token, hp: Math.max(0, Math.min(token.maxHp, token.hp + change))} 
        : token
    ));
  };

  const handleUpdateTokenAC = (change: number) => {
    if (!selectedToken) return;
    
    setTokens(prev => prev.map(token => 
      token.id === selectedTokenId 
        ? {...token, ac: Math.max(0, token.ac + change)} 
        : token
    ));
  };

  const handleToggleCondition = (condition: string) => {
    if (!selectedToken) return;
    
    setTokens(prev => prev.map(token => {
      if (token.id === selectedTokenId) {
        const hasCondition = (token.conditions || []).includes(condition);
        return {
          ...token,
          conditions: hasCondition 
            ? token.conditions.filter(c => c !== condition) 
            : [...token.conditions, condition]
        };
      }
      return token;
    }));
  };

  const handleToggleVisible = () => {
    if (!selectedToken) return;
    
    setTokens(prev => prev.map(token => 
      token.id === selectedTokenId 
        ? {...token, visible: !token.visible} 
        : token
    ));
  };

  const handleUpdateTokenSize = (newSize: number) => {
    if (!selectedToken) return;
    
    setTokens(prev => prev.map(token => 
      token.id === selectedTokenId 
        ? {...token, size: newSize} 
        : token
    ));
  };

  return (
    <div className="p-4 space-y-4">
      {selectedToken ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Выбранный токен</h3>
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <X size={18} />
            </Button>
          </div>
          
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader className="py-2">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedToken.img} 
                  alt={selectedToken.name} 
                  className="w-12 h-12 rounded-lg object-cover" 
                  style={{
                    borderColor: selectedToken.type === "boss" ? "#ff5555" 
                              : selectedToken.type === "monster" ? "#ff9955" : "#55ff55",
                    borderWidth: 2
                  }}
                />
                <div>
                  <h3 className="font-medium text-lg">{selectedToken.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedToken.type === "player" ? "Игрок" 
                    : selectedToken.type === "boss" ? "Босс" 
                    : selectedToken.type === "npc" ? "NPC" : "Монстр"}
                  </p>
                </div>
                <div className="ml-auto">
                  <Button 
                    variant={selectedToken.visible ? "outline" : "secondary"} 
                    size="icon"
                    onClick={handleToggleVisible}
                    title={selectedToken.visible ? "Скрыть от игроков" : "Показать игрокам"}
                  >
                    {selectedToken.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-4">
              <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="stats">Параметры</TabsTrigger>
                  <TabsTrigger value="conditions">Состояния</TabsTrigger>
                  <TabsTrigger value="actions">Действия</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stats" className="space-y-3">
                  <div>
                    <Label>Здоровье</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateTokenHP(-1)}
                      >
                        <span className="font-bold">-</span>
                      </Button>
                      
                      <div className="flex-1 bg-muted/30 rounded h-8 relative">
                        <div 
                          className="absolute inset-y-0 left-0 rounded" 
                          style={{
                            width: `${(selectedToken.hp / selectedToken.maxHp) * 100}%`,
                            backgroundColor: `rgba(${selectedToken.hp < selectedToken.maxHp / 2 ? '220, 38, 38' : '34, 197, 94'}, 0.6)`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-foreground font-medium">
                          {selectedToken.hp} / {selectedToken.maxHp}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateTokenHP(1)}
                      >
                        <span className="font-bold">+</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Класс брони (AC)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateTokenAC(-1)}
                      >
                        <span className="font-bold">-</span>
                      </Button>
                      
                      <div className="flex-1 flex items-center justify-center h-8 bg-muted/30 rounded font-medium">
                        {selectedToken.ac}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateTokenAC(1)}
                      >
                        <span className="font-bold">+</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Размер токена</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateTokenSize(Math.max(0.5, selectedToken.size - 0.5))}
                        title="Уменьшить"
                      >
                        <ZoomOut size={16} />
                      </Button>
                      <Slider
                        value={[selectedToken.size]}
                        min={0.5}
                        max={3}
                        step={0.5}
                        onValueChange={(values) => handleUpdateTokenSize(values[0])}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateTokenSize(Math.min(3, selectedToken.size + 0.5))}
                        title="Увеличить"
                      >
                        <ZoomIn size={16} />
                      </Button>
                    </div>
                    <div className="text-xs text-center mt-1 text-muted-foreground">
                      {selectedToken.size === 0.5 ? 'Крохотный' : 
                       selectedToken.size === 1 ? 'Обычный' : 
                       selectedToken.size === 1.5 ? 'Большой' : 
                       selectedToken.size === 2 ? 'Огромный' : 'Гигантский'}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="conditions" className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Оглушен", "Отравлен", "Парализован", "Испуган", 
                      "Бессознательный", "Схвачен", "Ослеплен", "Окаменен"
                    ].map((condition) => {
                      const isActive = selectedToken.conditions?.includes(condition);
                      return (
                        <Button 
                          key={condition}
                          variant={isActive ? "default" : "outline"}
                          className={`text-xs h-auto py-2 ${isActive ? 'bg-red-600 hover:bg-red-700' : ''}`}
                          onClick={() => handleToggleCondition(condition)}
                        >
                          {condition}
                        </Button>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">Атака</Button>
                    <Button variant="outline">Заклинание</Button>
                    <Button variant="outline">Навык</Button>
                    <Button variant="outline">Спасбросок</Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Бросить кубик</h4>
                    <div className="h-32 border rounded overflow-hidden">
                      <DiceRoller3D hideControls={true} initialDice="d20" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Управление картой</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex justify-between items-center">
                <Label htmlFor="fog-switch">Туман войны</Label>
                <Switch 
                  id="fog-switch" 
                  checked={fogOfWar} 
                  onCheckedChange={setFogOfWar}
                />
              </div>
              
              {fogOfWar && (
                <div>
                  <div className="flex justify-between items-center">
                    <Label>Радиус видимости</Label>
                    <span className="text-xs">{revealRadius} клеток</span>
                  </div>
                  <Slider
                    value={[revealRadius]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(values) => setRevealRadius(values[0])}
                    className="my-2"
                  />
                  <Button variant="outline" size="sm" className="w-full mt-1" onClick={onResetFogOfWar}>
                    Сбросить туман войны
                  </Button>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <Label htmlFor="grid-switch">Отображение сетки</Label>
                <Switch 
                  id="grid-switch" 
                  checked={gridVisible} 
                  onCheckedChange={setGridVisible}
                />
              </div>
              
              {gridVisible && (
                <div>
                  <div className="flex justify-between items-center">
                    <Label>Прозрачность сетки</Label>
                    <span className="text-xs">{Math.round(gridOpacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[gridOpacity]}
                    min={0.1}
                    max={1}
                    step={0.1}
                    onValueChange={(values) => setGridOpacity(values[0])}
                    className="my-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div>
          <h3 className="font-semibold">Выберите токен на карте</h3>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
