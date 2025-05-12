import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Dummy data for monster images
const monsterImages = {
  monster: '/icons/monster.png',
  boss: '/icons/boss.png',
  npc: '/icons/npc.png',
  player: '/icons/player.png'
};

const getDefaultTokenImage = (type: string) => {
  return monsterImages[type] || '/icons/monster.png';
};

const getMonsterImage = (type: string) => {
  return monsterImages[type] || '/icons/monster.png';
};

interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "boss" | "npc";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: any[];
  resources: {};
  isVisible: boolean;
  size: number;
}

const PlayBattlePage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nextTokenId, setNextTokenId] = useState(1);
  const [tokenType, setTokenType] = useState<"monster" | "boss" | "npc" | "player">("monster");
  const [size, setSize] = useState(20);
  const { toast } = useToast();
  const battleMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load tokens from local storage on initial load
    const savedTokens = localStorage.getItem('battleTokens');
    if (savedTokens) {
      setTokens(JSON.parse(savedTokens));
      // Ensure nextTokenId is greater than any existing token IDs
      const parsedTokens: Token[] = JSON.parse(savedTokens);
      const maxId = parsedTokens.reduce((max, token) => Math.max(max, token.id), 0);
      setNextTokenId(maxId + 1);
    }
  }, []);

  useEffect(() => {
    // Save tokens to local storage whenever tokens change
    localStorage.setItem('battleTokens', JSON.stringify(tokens));
  }, [tokens]);

  const handleAddToken = () => {
    const token = {
      id: nextTokenId,
      name: `Монстр ${nextTokenId}`,
      type: tokenType,
      img: getMonsterImage(tokenType),
      x: Math.floor(Math.random() * size),
      y: Math.floor(Math.random() * size),
      hp: 20,
      maxHp: 20,
      ac: 14,
      initiative: 10,
      conditions: [],
      resources: {},
      isVisible: true, // Changed from visible to isVisible
      size: 1
    };

    setTokens([...tokens, token]);
    setNextTokenId(nextTokenId + 1);

    toast({
      title: "Монстр добавлен",
      description: `Добавлен ${tokenType} ${nextTokenId}`,
    });
  };

  const handleImportToken = (tokenData: any) => {
    const importedToken = {
      id: tokenData.id || nextTokenId,
      name: tokenData.name,
      type: tokenData.type as "player" | "monster" | "boss" | "npc",
      img: tokenData.img || getDefaultTokenImage(tokenData.type),
      x: tokenData.x !== undefined ? tokenData.x : Math.floor(Math.random() * size),
      y: tokenData.y !== undefined ? tokenData.y : Math.floor(Math.random() * size),
      hp: tokenData.hp || 20,
      maxHp: tokenData.maxHp || 20,
      ac: tokenData.ac || 14,
      initiative: tokenData.initiative || 10,
      conditions: tokenData.conditions || [],
      resources: tokenData.resources || {},
      isVisible: tokenData.visible !== undefined ? tokenData.visible : true, // Fixed property name
      size: tokenData.size || 1
    };

    setTokens([...tokens, importedToken]);
    setNextTokenId(Math.max(nextTokenId, importedToken.id + 1));

    toast({
      title: "Монстр импортирован",
      description: `Импортирован ${importedToken.type} ${importedToken.name}`,
    });
  };

  const handleRemoveToken = (tokenId: number) => {
    setTokens(tokens.filter(token => token.id !== tokenId));
    toast({
      title: "Монстр удален",
      description: `Монстр ${tokenId} удален`,
    });
  };

  const handleClearBattlefield = () => {
    setTokens([]);
    localStorage.removeItem('battleTokens');
    setNextTokenId(1);
    toast({
      title: "Поле боя очищено",
      description: "Все монстры удалены",
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-secondary p-4">
        <h1 className="text-2xl font-semibold">Поле боя</h1>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 p-4 border-r">
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-type">Тип монстра</Label>
                <select
                  id="token-type"
                  className="w-full p-2 border rounded"
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value as "monster" | "boss" | "npc" | "player")}
                >
                  <option value="monster">Монстр</option>
                  <option value="boss">Босс</option>
                  <option value="npc">NPC</option>
                  <option value="player">Игрок</option>
                </select>
              </div>

              <Button onClick={handleAddToken} className="w-full">Добавить монстра</Button>
              <Button onClick={() => handleImportToken({
                id: nextTokenId,
                name: 'Новый импортированный монстр',
                type: tokenType,
                img: getMonsterImage(tokenType),
                x: Math.floor(Math.random() * size),
                y: Math.floor(Math.random() * size),
                hp: 20,
                maxHp: 20,
                ac: 14,
                initiative: 10,
                conditions: [],
                resources: {},
                visible: true,
                size: 1
              })} className="w-full">Импорт монстра</Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">Очистить поле боя</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие удалит всех монстров с поля боя.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearBattlefield}>Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 p-4">
          <div
            ref={battleMapRef}
            className="relative bg-stone-700 rounded"
            style={{ width: `${size * 32}px`, height: `${size * 32}px` }}
          >
            {tokens.map(token => (
              <div
                key={token.id}
                className="absolute flex flex-col items-center justify-center"
                style={{
                  left: `${token.x * 32}px`,
                  top: `${token.y * 32}px`,
                  width: '32px',
                  height: '32px',
                }}
              >
                <img
                  src={token.img}
                  alt={token.name}
                  className="w-8 h-8 object-cover rounded-full"
                />
                <span className="text-white text-xs mt-1">{token.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => handleRemoveToken(token.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayBattlePage;
