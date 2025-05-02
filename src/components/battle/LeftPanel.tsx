import React, { useState } from "react";
import { Token, Initiative } from "@/pages/PlayBattlePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Skull, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LeftPanelProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  initiative: Initiative[];
  setInitiative: React.Dispatch<React.SetStateAction<Initiative[]>>;
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  battleState: {
    isActive: boolean;
    round: number;
    currentInitiativeIndex: number;
  };
  fogOfWar: boolean;
  setFogOfWar: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: { rows: number; cols: number };
  setGridSize: React.Dispatch<React.SetStateAction<{ rows: number; cols: number }>>;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  tokens,
  setTokens,
  initiative,
  setInitiative,
  selectedTokenId,
  onSelectToken,
  battleState,
  fogOfWar,
  setFogOfWar,
  gridSize,
  setGridSize,
}) => {
  const [isAddingMonster, setIsAddingMonster] = useState(false);
  const [monsterName, setMonsterName] = useState("");
  const [monsterHP, setMonsterHP] = useState("");
  const [monsterAC, setMonsterAC] = useState("");
  const [monsterType, setMonsterType] = useState<"monster" | "boss">("monster");
  const { toast } = useToast();

  // Функция для добавления токена
  const onAddToken = (newToken: Token) => {
    setTokens((prev) => [...prev, newToken]);

    // Add to initiative if battle is active
    if (battleState.isActive) {
      const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(newToken.initiative);
      const newInitiative: Initiative = {
        id: Date.now(),
        tokenId: newToken.id,
        name: newToken.name,
        roll,
        isActive: false,
      };

      const updatedInitiative = [...initiative, newInitiative].sort((a, b) => b.roll - a.roll);
      setInitiative(updatedInitiative);
    }
  };

  // Функция для добавления монстра из полей формы
  const addMonster = () => {
    if (!monsterName || !monsterHP || !monsterAC) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    const newToken: Token = {
      id: Date.now(),
      name: monsterName,
      type: monsterType as "monster" | "boss",
      img: monsterType === "boss" 
        ? "/assets/tokens/boss1.png"
        : "/assets/tokens/monster1.png",
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      hp: parseInt(monsterHP), // Исправлено: преобразуем строку в число
      maxHp: parseInt(monsterHP), // Исправлено: преобразуем строку в число
      ac: parseInt(monsterAC), // Исправлено: преобразуем строку в число
      initiative: 10, // Исправлено: используем числовое значение для инициативы
      conditions: [],
      resources: {},
      visible: true,
      size: monsterType === "boss" ? 1.5 : 1
    };

    onAddToken(newToken);
    
    // Сбрасываем форму
    setMonsterName("");
    setMonsterHP("");
    setMonsterAC("");
    setIsAddingMonster(false);
    
    toast({
      title: `${monsterType === "boss" ? "Босс" : "Монстр"} добавлен`,
      description: `${newToken.name} добавлен на поле боя`,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Управление битвой</h2>

      {/* Добавление монстра */}
      <div>
        <Button onClick={() => setIsAddingMonster(!isAddingMonster)}>
          {isAddingMonster ? "Скрыть форму" : "Добавить Монстра"}
        </Button>

        {isAddingMonster && (
          <div className="mt-2 space-y-2">
            <Input
              type="text"
              placeholder="Имя монстра"
              value={monsterName}
              onChange={(e) => setMonsterName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="HP"
              value={monsterHP}
              onChange={(e) => setMonsterHP(e.target.value)}
            />
            <Input
              type="number"
              placeholder="AC"
              value={monsterAC}
              onChange={(e) => setMonsterAC(e.target.value)}
            />
            <select
              value={monsterType}
              onChange={(e) => setMonsterType(e.target.value as "monster" | "boss")}
              className="w-full p-2 border rounded"
            >
              <option value="monster">Монстр</option>
              <option value="boss">Босс</option>
            </select>
            <Button onClick={addMonster} className="w-full">
              Добавить
            </Button>
          </div>
        )}
      </div>

      {/* Список токенов */}
      <div>
        <h3 className="font-medium">Токены на поле ({tokens.length})</h3>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`flex items-center justify-between p-2 rounded ${
                  selectedTokenId === token.id ? "bg-primary/20 border border-primary" : "bg-card"
                }`}
                onClick={() => onSelectToken(token.id)}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={token.img}
                    alt={token.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <div>{token.name}</div>
                    <div className="text-xs text-muted-foreground">
                      HP: {token.hp}/{token.maxHp} AC: {token.ac}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Инициатива */}
      <div>
        <h3 className="font-medium">Инициатива</h3>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {initiative.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2 rounded ${
                  item.isActive ? "bg-primary/20 border border-primary" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full font-medium">
                    {item.roll}
                  </div>
                  <div className="text-sm">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Настройки тумана войны */}
      <div>
        <h3 className="font-medium">Туман войны</h3>
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-5 w-5 border rounded"
            checked={fogOfWar}
            onChange={(e) => setFogOfWar(e.target.checked)}
          />
          <span>Включить</span>
        </label>
      </div>

      {/* Настройки размера сетки */}
      <div>
        <h3 className="font-medium">Размер сетки</h3>
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium">Строки</label>
            <Input
              type="number"
              value={gridSize.rows}
              onChange={(e) => setGridSize({ ...gridSize, rows: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Столбцы</label>
            <Input
              type="number"
              value={gridSize.cols}
              onChange={(e) => setGridSize({ ...gridSize, cols: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
