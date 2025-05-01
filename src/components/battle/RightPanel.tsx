
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  Shield, 
  Dice1, 
  AtSign, 
  Flame, 
  Eye, 
  EyeOff,
  Feather,
  Swords,
  BookOpen,
  Plus // Added missing Plus icon import here
} from "lucide-react";
import { Token } from "@/pages/PlayBattlePage";

interface RightPanelProps {
  selectedTokenId: number | null;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}

const conditions = [
  "Оглушен", "Ослеплен", "Истощен", "Парализован", 
  "Отравлен", "Испуган", "Схвачен", "Сбит с ног", "Без сознания"
];

const RightPanel: React.FC<RightPanelProps> = ({
  selectedTokenId,
  tokens,
  setTokens,
}) => {
  const selectedToken = tokens.find(token => token.id === selectedTokenId);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [diceType, setDiceType] = useState<string>("d20");
  
  const rollDice = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    setDiceResult(result);
    setDiceType(`d${sides}`);
  };
  
  const updateTokenHP = (newHP: number) => {
    if (!selectedToken) return;
    setTokens(tokens.map(token => 
      token.id === selectedToken.id 
        ? { ...token, hp: Math.max(0, Math.min(token.maxHp, newHP)) } 
        : token
    ));
  };
  
  const updateTokenAC = (newAC: number) => {
    if (!selectedToken) return;
    setTokens(tokens.map(token => 
      token.id === selectedToken.id ? { ...token, ac: newAC } : token
    ));
  };
  
  const toggleCondition = (condition: string) => {
    if (!selectedToken) return;
    
    const hasCondition = selectedToken.conditions.includes(condition);
    const updatedConditions = hasCondition
      ? selectedToken.conditions.filter(c => c !== condition)
      : [...selectedToken.conditions, condition];
    
    setTokens(tokens.map(token => 
      token.id === selectedToken.id ? { ...token, conditions: updatedConditions } : token
    ));
  };
  
  const toggleVisibility = () => {
    if (!selectedToken) return;
    
    setTokens(tokens.map(token => 
      token.id === selectedToken.id ? { ...token, visible: !token.visible } : token
    ));
  };

  return (
    <div className="w-80 bg-muted/5 border-l border-border flex flex-col h-[calc(100vh-13rem-56px)]">
      {selectedToken ? (
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Детали</TabsTrigger>
            <TabsTrigger value="abilities" className="flex-1">Способности</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">Заметки</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-3">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={selectedToken.img} 
                alt={selectedToken.name}
                className={`w-16 h-16 rounded-full object-cover border-2 ${
                  selectedToken.type === "boss"
                    ? "border-red-500"
                    : selectedToken.type === "monster"
                    ? "border-yellow-500"
                    : "border-green-500"
                }`} 
              />
              <div>
                <h2 className="font-bold text-lg">{selectedToken.name}</h2>
                <div className="text-sm text-muted-foreground">
                  {selectedToken.type === "boss" 
                    ? "Босс" 
                    : selectedToken.type === "monster" 
                    ? "Монстр" 
                    : selectedToken.type === "npc" 
                    ? "НПС" 
                    : "Игрок"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button 
                    size="sm" 
                    variant={selectedToken.visible ? "outline" : "default"}
                    className="h-6 py-0 px-2"
                    onClick={toggleVisibility}
                  >
                    {selectedToken.visible ? (
                      <><Eye className="h-3 w-3 mr-1" /> Видим</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" /> Скрыт</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* HP и AC */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center mb-1">
                    <Heart className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm font-medium">Здоровье</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Input 
                      type="number" 
                      className="w-16" 
                      value={selectedToken.hp}
                      onChange={(e) => updateTokenHP(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-muted-foreground">/</span>
                    <Input 
                      type="number" 
                      className="w-16" 
                      value={selectedToken.maxHp}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <Shield className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm font-medium">Класс брони</span>
                  </div>
                  <Input 
                    type="number" 
                    className="w-16" 
                    value={selectedToken.ac}
                    onChange={(e) => updateTokenAC(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              {/* Броски кубиков */}
              <div>
                <div className="flex items-center mb-1">
                  <Dice1 className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium">Броски</span>
                </div>
                <div className="flex gap-1">
                  {[4, 6, 8, 10, 12, 20].map(sides => (
                    <Button 
                      key={sides} 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => rollDice(sides)}
                    >
                      d{sides}
                    </Button>
                  ))}
                </div>
                {diceResult !== null && (
                  <div className="mt-2 text-center py-1 bg-muted/20 rounded-md">
                    {diceType}: <span className="font-bold">{diceResult}</span>
                  </div>
                )}
              </div>
              
              {/* Состояния */}
              <div>
                <div className="flex items-center mb-1">
                  <AtSign className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">Состояния</span>
                </div>
                <ScrollArea className="h-28 border rounded-md p-1">
                  <div className="grid grid-cols-2 gap-1">
                    {conditions.map(condition => (
                      <div key={condition} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`condition-${condition}`}
                          checked={selectedToken.conditions.includes(condition)}
                          onChange={() => toggleCondition(condition)}
                          className="mr-1.5"
                        />
                        <label htmlFor={`condition-${condition}`} className="text-sm">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="abilities" className="p-3">
            <div className="space-y-4">
              {/* Атаки */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Swords className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm font-medium">Атаки</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 p-1">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Длинный меч</div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>+5 к атаке</span>
                      <span>1d8+3 рубящий</span>
                    </div>
                    <div className="mt-1 flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-6 px-2 py-0">Атака</Button>
                      <Button size="sm" variant="outline" className="h-6 px-2 py-0">Урон</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Заклинания */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Flame className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm font-medium">Заклинания</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 p-1">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Огненный шар</div>
                    <div className="text-sm text-muted-foreground">3 уровень, 8d6 урона огнем</div>
                    <div className="mt-1 flex justify-end">
                      <Button size="sm" variant="outline" className="h-6 px-2 py-0">Каст</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Особые умения */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Feather className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm font-medium">Особые умения</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="p-2 border rounded-md">
                    <div className="font-medium">Вторая атака</div>
                    <div className="text-sm text-muted-foreground">
                      Позволяет атаковать дважды за одно действие
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="p-3">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <BookOpen className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium">Заметки ДМ</span>
                </div>
                <textarea 
                  className="w-full h-60 p-2 border rounded-md bg-background"
                  placeholder="Заметки для Мастера о персонаже или монстре..."
                ></textarea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-2" />
          <p>Выберите токен на карте или из списка слева</p>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
