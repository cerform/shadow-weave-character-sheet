
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Skull, 
  Crown, 
  Plus, 
  X, 
  Heart, 
  ArrowUp, 
  ArrowDown,
  Shield,
  Settings,
  Image,
  Link
} from "lucide-react";
import { Token, Initiative, BattleState } from "@/pages/PlayBattlePage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs as DialogTabs, TabsContent as DialogTabsContent, TabsList as DialogTabsList, TabsTrigger as DialogTabsTrigger } from "@/components/ui/tabs";

interface LeftPanelProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  initiative: Initiative[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  battleState: BattleState;
}

// Примеры монстров с фэнтези-изображениями
const monsterTemplates = [
  { name: "Гоблин", hp: 7, ac: 15, img: "https://i.pinimg.com/564x/45/4c/4a/454c4a7d28b104e60940d3d0dcf8f45f.jpg", type: "monster" },
  { name: "Орк", hp: 15, ac: 13, img: "https://i.pinimg.com/564x/c2/8e/13/c28e130ac110eb3fdd474d13af700cea.jpg", type: "monster" },
  { name: "Тролль", hp: 84, ac: 15, img: "https://i.pinimg.com/564x/7d/b3/40/7db340b2c75dd7e0aab841045e9d2c1b.jpg", type: "boss" },
  { name: "Дракон", hp: 178, ac: 19, img: "https://i.pinimg.com/564x/bf/8a/69/bf8a69fe5eb10ded5c6f3920a757baa9.jpg", type: "boss" },
  { name: "Скелет", hp: 13, ac: 13, img: "https://i.pinimg.com/564x/e2/f2/12/e2f212e09a97a4def5714cb8ac7726db.jpg", type: "monster" },
  { name: "Слайм", hp: 22, ac: 11, img: "https://i.pinimg.com/564x/84/ee/80/84ee80563c7f3921f8a803a7d44a1d00.jpg", type: "monster" },
  { name: "Вампир", hp: 144, ac: 16, img: "https://i.pinimg.com/564x/16/52/f3/1652f3e0521e34a64f42b6b88fd241e4.jpg", type: "boss" },
  { name: "Минотавр", hp: 76, ac: 14, img: "https://i.pinimg.com/564x/42/04/24/420424a4643b532794fd0bd8baf9cd9d.jpg", type: "boss" }
];

const LeftPanel: React.FC<LeftPanelProps> = ({ 
  tokens, 
  setTokens, 
  initiative, 
  selectedTokenId, 
  onSelectToken,
  battleState
}) => {
  const [newTokenName, setNewTokenName] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [newTokenType, setNewTokenType] = useState<Token["type"]>("player");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddToken = (type: Token["type"]) => {
    setNewTokenType(type);
    setImageDialogOpen(true);
  };
  
  const createToken = (imageUrl: string) => {
    if (!newTokenName || !imageUrl) return;
    
    const newToken: Token = {
      id: Date.now(),
      name: newTokenName,
      type: newTokenType,
      img: imageUrl,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: newTokenType === "boss" ? 100 : newTokenType === "monster" ? 20 : 30,
      maxHp: newTokenType === "boss" ? 100 : newTokenType === "monster" ? 20 : 30,
      ac: newTokenType === "boss" ? 17 : newTokenType === "monster" ? 13 : 15,
      initiative: Math.floor(Math.random() * 5), // This is where the fix happens: ensuring initiative is a number
      conditions: [],
      resources: {},
      visible: true
    };
    
    setTokens(prev => [...prev, newToken]);
    setNewTokenName("");
    setImageUrl("");
    setShowAddMenu(false);
    setImageDialogOpen(false);
  };
  
  const handleAddMonsterTemplate = (monster: typeof monsterTemplates[0]) => {
    const newToken: Token = {
      id: Date.now(),
      name: monster.name,
      type: monster.type as Token["type"],
      img: monster.img,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      initiative: Math.floor(Math.random() * 5),
      conditions: [],
      resources: {},
      visible: true
    };
    
    setTokens(prev => [...prev, newToken]);
  };
  
  const handleUpdateTokenHP = (id: number, change: number) => {
    setTokens(tokens.map(token => 
      token.id === id 
        ? { ...token, hp: Math.max(0, Math.min(token.maxHp, token.hp + change)) } 
        : token
    ));
  };
  
  const handleRemoveToken = (id: number) => {
    setTokens(tokens.filter(token => token.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-64 bg-muted/5 border-r border-border flex flex-col">
      <Tabs defaultValue="creatures">
        <TabsList className="w-full">
          <TabsTrigger value="creatures" className="flex-1">Существа</TabsTrigger>
          <TabsTrigger value="initiative" className="flex-1">Инициатива</TabsTrigger>
        </TabsList>
        
        <TabsContent value="creatures" className="p-2 flex flex-col h-[calc(100vh-13rem-56px-3.5rem)]">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Участники ({tokens.length})</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowAddMenu(!showAddMenu)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {showAddMenu && (
            <div className="mb-2 p-2 border rounded-md bg-muted/10">
              <Input
                size="sm"
                placeholder="Имя существа..."
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="mb-2"
              />
              <div className="grid grid-cols-3 gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex flex-col h-auto py-1"
                  onClick={() => handleAddToken("player")}
                >
                  <Users className="h-4 w-4 mb-1" />
                  <span className="text-xs">Игрок</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex flex-col h-auto py-1"
                  onClick={() => handleAddToken("monster")}
                >
                  <Skull className="h-4 w-4 mb-1" />
                  <span className="text-xs">Монстр</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex flex-col h-auto py-1"
                  onClick={() => handleAddToken("boss")}
                >
                  <Crown className="h-4 w-4 mb-1" />
                  <span className="text-xs">Босс</span>
                </Button>
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {tokens.map((token) => (
                <div 
                  key={token.id}
                  className={`p-2 border rounded-md ${
                    selectedTokenId === token.id ? "bg-primary/20 border-primary" : "bg-card"
                  } cursor-pointer`}
                  onClick={() => onSelectToken(token.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="relative">
                      <img 
                        src={token.img} 
                        alt={token.name}
                        className={`w-8 h-8 rounded-full object-cover border-2 ${
                          token.type === "boss"
                            ? "border-red-500"
                            : token.type === "monster"
                            ? "border-yellow-500"
                            : "border-green-500"
                        }`} 
                      />
                      {token.conditions.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {token.conditions.length}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{token.name}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Shield className="w-3 h-3 mr-1" /> КД: {token.ac}
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleRemoveToken(token.id); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span className="text-xs">{token.hp}/{token.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-5 w-5 p-0"
                        onClick={(e) => { e.stopPropagation(); handleUpdateTokenHP(token.id, -1); }}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-5 w-5 p-0"
                        onClick={(e) => { e.stopPropagation(); handleUpdateTokenHP(token.id, 1); }}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {tokens.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Нет участников. Добавьте игроков и монстров.
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Шаблоны монстров</h3>
              <div className="grid grid-cols-2 gap-1">
                {monsterTemplates.map((monster, idx) => (
                  <Button 
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="h-auto py-1 px-2 flex flex-col items-center justify-center"
                    onClick={() => handleAddMonsterTemplate(monster)}
                  >
                    <img 
                      src={monster.img} 
                      alt={monster.name}
                      className="w-6 h-6 rounded-full mb-1 object-cover" 
                    />
                    <span className="text-xs">{monster.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="initiative" className="p-2 flex flex-col h-[calc(100vh-13rem-56px-3.5rem)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Порядок инициативы</h3>
            <div className="text-sm text-muted-foreground">
              {battleState.isActive && `Раунд ${battleState.round}`}
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {initiative.length > 0 ? (
              <div className="space-y-1">
                {initiative.map((item, index) => {
                  const token = tokens.find(t => t.id === item.tokenId);
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-2 p-2 rounded-md ${
                        item.isActive ? "bg-primary/20 border border-primary" : "bg-card border border-transparent"
                      } cursor-pointer`}
                      onClick={() => token && onSelectToken(token.id)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full font-medium">
                        {item.roll}
                      </div>
                      
                      {token && (
                        <img src={token.img} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {tokens.length === 0 
                  ? "Сначала добавьте участников" 
                  : "Нажмите 'Начать бой' для броска инициативы"}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="p-2 bg-muted/10 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full">
          <Settings className="w-3 h-3 mr-1" /> Настройки сцены
        </Button>
      </div>

      {/* Модальное окно для выбора изображения */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выбор изображения для {newTokenName || "токена"}</DialogTitle>
          </DialogHeader>
          
          <DialogTabs defaultValue="upload" className="w-full">
            <DialogTabsList className="grid grid-cols-2 w-full">
              <DialogTabsTrigger value="upload">Загрузить</DialogTabsTrigger>
              <DialogTabsTrigger value="url">По ссылке</DialogTabsTrigger>
            </DialogTabsList>
            
            <DialogTabsContent value="upload" className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Image className="mr-2 h-4 w-4" />
                  Выбрать файл
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                
                {imageUrl && (
                  <div className="relative w-32 h-32 border rounded">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                
                <Button 
                  disabled={!imageUrl || !newTokenName} 
                  onClick={() => createToken(imageUrl)}
                  className="w-full"
                >
                  Создать
                </Button>
              </div>
            </DialogTabsContent>
            
            <DialogTabsContent value="url" className="space-y-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Имя
                  </label>
                  <Input
                    id="name"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="Имя существа"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium">
                    URL изображения
                  </label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {imageUrl && (
                  <div className="relative w-32 h-32 mx-auto border rounded">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Ошибка";
                      }}
                    />
                  </div>
                )}
                
                <Button 
                  disabled={!imageUrl || !newTokenName} 
                  onClick={() => createToken(imageUrl)}
                  className="w-full"
                >
                  <Link className="mr-2 h-4 w-4" />
                  Создать
                </Button>
              </div>
            </DialogTabsContent>
          </DialogTabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeftPanel;
