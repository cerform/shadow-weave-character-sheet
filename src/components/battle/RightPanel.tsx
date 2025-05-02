
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Token } from '@/stores/battleStore';

interface RightPanelProps {
  selectedTokenId: number | null;
  tokens: Token[];
  updateToken: (id: number, updates: Partial<Token>) => void;
  fogOfWar: boolean;
  setFogOfWar: (enabled: boolean) => void;
  revealRadius: number;
  setRevealRadius: (radius: number) => void;
  gridVisible: boolean;
  setGridVisible: (visible: boolean) => void;
  gridOpacity: number;
  setGridOpacity: (opacity: number) => void;
  onResetFogOfWar: () => void;
  isDM: boolean;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedTokenId,
  tokens,
  updateToken,
  fogOfWar,
  setFogOfWar,
  revealRadius,
  setRevealRadius,
  gridVisible,
  setGridVisible,
  gridOpacity,
  setGridOpacity,
  onResetFogOfWar,
  isDM
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("stats");
  
  // Находим выбранный токен
  const selectedToken = selectedTokenId !== null 
    ? tokens.find(t => t.id === selectedTokenId) 
    : null;
    
  if (!selectedToken) {
    return (
      <div className="p-4 text-center">
        <div className="text-muted-foreground">Выберите токен для просмотра деталей</div>
      </div>
    );
  }
  
  // Обработчики обновлений токена
  const handleStatChange = (stat: string, value: number | string) => {
    if (selectedToken) {
      updateToken(selectedToken.id, { 
        [stat]: typeof value === 'string' ? value : Number(value)
      } as any);
    }
  };
  
  const handleConditionToggle = (condition: string) => {
    if (!selectedToken) return;
    
    const currentConditions = [...(selectedToken.conditions || [])];
    const index = currentConditions.indexOf(condition);
    
    if (index >= 0) {
      currentConditions.splice(index, 1);
    } else {
      currentConditions.push(condition);
    }
    
    updateToken(selectedToken.id, { conditions: currentConditions });
  };
  
  // Определение типа токена для отображения
  const tokenTypeName = 
    selectedToken.type === "player" ? "Игрок" :
    selectedToken.type === "monster" ? "Монстр" :
    selectedToken.type === "boss" ? "Босс" : "NPC";
    
  // Процент здоровья
  const healthPercent = Math.floor((selectedToken.hp / selectedToken.maxHp) * 100);
  const healthColor = 
    healthPercent >= 66 ? "bg-green-500" : 
    healthPercent >= 33 ? "bg-yellow-500" : 
    "bg-red-500";
  
  // Список возможных состояний
  const conditions = [
    "Испуган", "Отравлен", "Ошеломлен", "Оглушен", 
    "Лежащий", "Схвачен", "Опутан", "Ослеплен",
    "Очарован", "Окаменелый", "Парализован", "Невидимый"
  ];
  
  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full bg-muted overflow-hidden"
              style={{
                backgroundImage: `url(${selectedToken.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderColor: 
                  selectedToken.type === "player" ? "#4CAF50" : 
                  selectedToken.type === "boss" ? "#F44336" : 
                  "#FF9800",
                borderWidth: 2,
                borderStyle: 'solid'
              }}
            />
            <div>
              <h3 className="font-semibold">{selectedToken.name}</h3>
              <div className="text-xs text-muted-foreground">{tokenTypeName}</div>
            </div>
          </div>
          
          {isDM && (
            <Button variant="outline" size="sm">
              Изменить
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs defaultValue="stats" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="stats" className="text-xs">Характеристики</TabsTrigger>
              <TabsTrigger value="conditions" className="text-xs">Состояния</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">Ресурсы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="pt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hp" className="mb-2 block">Здоровье</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatChange('hp', Math.max(0, selectedToken.hp - 1))}
                      disabled={!isDM && selectedToken.type !== "player"}
                    >-</Button>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div className={`h-full ${healthColor}`} style={{width: `${healthPercent}%`}}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>Текущее: {selectedToken.hp}</span>
                        <span>Максимум: {selectedToken.maxHp}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatChange('hp', Math.min(selectedToken.maxHp, selectedToken.hp + 1))}
                      disabled={!isDM && selectedToken.type !== "player"}
                    >+</Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ac" className="mb-2 block">Класс доспеха (AC)</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatChange('ac', selectedToken.ac - 1)}
                      disabled={!isDM}
                    >-</Button>
                    <div className="flex-1 text-center font-semibold text-xl">
                      {selectedToken.ac}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatChange('ac', selectedToken.ac + 1)}
                      disabled={!isDM}
                    >+</Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="size" className="mb-2 block">Размер токена</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow flex items-center gap-2">
                      <ZoomOut size={16} />
                      <Slider
                        id="size"
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        defaultValue={[selectedToken.size || 1]}
                        value={[selectedToken.size || 1]}
                        onValueChange={([value]) => handleStatChange('size', value)}
                        disabled={!isDM}
                      />
                      <ZoomIn size={16} />
                    </div>
                    <div className="w-12 text-center">
                      {selectedToken.size?.toFixed(1) || '1.0'}x
                    </div>
                  </div>
                </div>
                
                {isDM && (
                  <div>
                    <Label htmlFor="visible" className="mb-2 block">Видимость токена</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="visible"
                        checked={selectedToken.visible}
                        onCheckedChange={(checked) => handleStatChange('visible', checked)}
                      />
                      <span className="text-sm">{selectedToken.visible ? 'Видим всем' : 'Скрыт (только DM)'}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="pt-4">
              <div className="grid grid-cols-2 gap-2">
                {conditions.map(condition => (
                  <Button
                    key={condition}
                    variant={selectedToken.conditions?.includes(condition) ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleConditionToggle(condition)}
                    disabled={!isDM && selectedToken.type !== "player"}
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="pt-4">
              <div className="text-center text-muted-foreground py-4">
                Дополнительные ресурсы появятся в следующей версии
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Секция настроек карты */}
      {isDM && (
        <Card className="mb-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Настройки отображения</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fog-of-war" className="cursor-pointer">Туман войны</Label>
                <Switch 
                  id="fog-of-war" 
                  checked={fogOfWar}
                  onCheckedChange={setFogOfWar}
                />
              </div>
              
              {fogOfWar && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reveal-radius" className="block">Радиус обзора</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="reveal-radius"
                        min={1}
                        max={10}
                        step={1}
                        defaultValue={[revealRadius]}
                        value={[revealRadius]}
                        onValueChange={([value]) => setRevealRadius(value)}
                      />
                      <span className="w-8 text-center">{revealRadius}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={onResetFogOfWar}
                  >
                    Сбросить туман войны
                  </Button>
                </>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <Label htmlFor="grid-visible" className="cursor-pointer">Показывать сетку</Label>
                <Switch 
                  id="grid-visible" 
                  checked={gridVisible}
                  onCheckedChange={setGridVisible}
                />
              </div>
              
              {gridVisible && (
                <div className="space-y-2">
                  <Label htmlFor="grid-opacity" className="block">Прозрачность сетки</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="grid-opacity"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      defaultValue={[gridOpacity]}
                      value={[gridOpacity]}
                      onValueChange={([value]) => setGridOpacity(value)}
                    />
                    <span className="w-12 text-center">{Math.round(gridOpacity * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RightPanel;
