// В LeftPanel.tsx нужно исправить ошибку с типом initiative, чтобы оно всегда было числом
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Sword, Shield, Zap, PlusCircle, MinusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Вспомогательные компоненты и утилиты
import { useToast } from '@/components/ui/use-toast';

// Типы данных из PlayBattlePage.tsx
import { Token, Initiative, BattleState } from '@/pages/PlayBattlePage';

// Обновленные типы для LeftPanel
export interface LeftPanelProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  initiative: Initiative[];
  setInitiative: React.Dispatch<React.SetStateAction<Initiative[]>>;  // Делаем обязательным, а не опциональным
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  battleState: BattleState;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  tokens,
  setTokens,
  initiative,
  setInitiative, // Используем параметр напрямую
  selectedTokenId,
  onSelectToken,
  battleState
}) => {
  const { toast } = useToast();
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [monsterQuantity, setMonsterQuantity] = useState(1);
  const [newMonsterName, setNewMonsterName] = useState('');

  // Обработчики для управления боевым порядком
  const startCombat = () => {
    if (tokens.length < 1) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одного участника в бой",
        variant: "destructive",
      });
      return;
    }

    // Сортируем участников по инициативе (от большей к меньшей)
    const sortedCombatants = [...initiative].sort(
      (a, b) => b.roll - a.roll
    );

    // Используем setInitiative напрямую, так как он теперь обязательный параметр
    setInitiative(sortedCombatants);
    battleState.currentInitiativeIndex = 0;
    battleState.isActive = true;

    toast({
      title: "Бой начался!",
      description: `Ход ${sortedCombatants[0]?.name || "первого участника"}`,
    });
  };

  const endCombat = () => {
    battleState.isActive = false;
    battleState.currentInitiativeIndex = -1;
    toast({
      title: "Бой завершен",
      description: "Инициатива сброшена",
    });
  };

  const nextTurn = () => {
    if (initiative.length === 0) return;
    
    let nextIndex = (battleState.currentInitiativeIndex + 1) % initiative.length;
    battleState.currentInitiativeIndex = nextIndex;
    
    toast({
      title: "Следующий ход",
      description: `Ход ${initiative[nextIndex]?.name || "следующего участника"}`,
    });
  };

  // Добавление монстра в бой
  const addMonster = (monster: any | null = null) => {
    // Если не выбран монстр из списка и не введено имя монстра, показываем ошибку
    if (!monster && (!newMonsterName || newMonsterName.trim() === '')) {
      toast({
        title: "Ошибка",
        description: "Выберите монстра из списка или введите имя нового",
        variant: "destructive",
      });
      return;
    }

    // Подготовка нового монстра
    const baseMonster = monster || {
      id: `custom-${Date.now()}`,
      name: newMonsterName,
      type: "Неизвестно",
      hp: 10,
      ac: 10,
      cr: "0",
      abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
    };

    // Добавление указанного количества монстров
    const newTokens: Token[] = [];
    
    for (let i = 0; i < monsterQuantity; i++) {
      newTokens.push({
        id: Date.now() + i,
        name: monsterQuantity > 1 ? `${baseMonster.name} ${i + 1}` : baseMonster.name,
        type: 'monster',
        img: '/images/tokens/monster.png',
        x: 0,
        y: 0,
        hp: baseMonster.hp,
        maxHp: baseMonster.hp,
        ac: baseMonster.ac,
        initiative: 10,
        conditions: [],
        resources: {},
        visible: true
      });
    }
    
    setTokens([...tokens, ...newTokens]);
    
    // Сброс полей формы
    setSelectedMonsterId(null);
    setMonsterQuantity(1);
    setNewMonsterName('');
    
    toast({
      title: "Монстр добавлен",
      description: `${monsterQuantity} ${baseMonster.name} добавлен в бой`,
    });
  };

  // Удаление участника из боя
  const removeToken = (id: number) => {
    setTokens(tokens.filter(c => c.id !== id));
    
    // Если удаляем активного участника, переходим к следующему
    if (battleState.isActive && initiative[battleState.currentInitiativeIndex]?.tokenId === id) {
      nextTurn();
    }
  };

  // Обновление хитпоинтов участника
  const updateTokenHP = (id: number, change: number) => {
    setTokens(tokens.map(c => {
      if (c.id === id) {
        const newHP = Math.max(0, Math.min(c.maxHp, c.hp + change));
        return { ...c, hp: newHP };
      }
      return c;
    }));
  };

  // Функция для отображения списка участников боя
  const renderTokens = () => {
    if (tokens.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          Нет участников боя. Добавьте персонажей или монстров.
        </div>
      );
    }

    return tokens.map((token, index) => {
      const isCurrentTurn = battleState.isActive && initiative[battleState.currentInitiativeIndex]?.tokenId === token.id;
      
      return (
        <div 
          key={token.id}
          className={`p-3 border rounded-md mb-2 ${isCurrentTurn ? 'bg-primary/10 border-primary' : ''}`}
        >
          <div className="flex justify-between items-center">
            <div className="font-medium">{token.name}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => removeToken(token.id)}
            >
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">HP</div>
              <div className="flex items-center justify-center mt-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => updateTokenHP(token.id, -1)}
                >
                  <MinusCircle className="h-3 w-3" />
                </Button>
                <span className="mx-2">
                  {token.hp}/{token.maxHp}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => updateTokenHP(token.id, 1)}
                >
                  <PlusCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground">AC</div>
              <div className="mt-1">{token.ac}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Инициатива</div>
              <div className="mt-1">{token.initiative}</div>
            </div>
          </div>
          
          {token.conditions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Состояния:</div>
              <div className="flex flex-wrap gap-1">
                {token.conditions.map((condition, i) => (
                  <Badge key={i} variant="outline">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="h-[calc(100vh-2rem)] overflow-hidden flex flex-col p-0">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Участники боя</h3>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex space-x-2">
          <Button 
            onClick={battleState.isActive ? endCombat : startCombat} 
            variant={battleState.isActive ? "destructive" : "default"}
            className="flex-1"
          >
            {battleState.isActive ? "Завершить бой" : "Начать бой"}
          </Button>
          
          {battleState.isActive && (
            <Button onClick={nextTurn} variant="outline">
              Следующий ход
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {renderTokens()}
      </div>
      
      <div className="p-4 border-t">
        <h4 className="text-sm font-medium mb-2">Добавить монстра</h4>
        <div className="space-y-3">
          <div>
            <Input
              placeholder="Имя нового монстра..."
              value={newMonsterName}
              onChange={(e) => setNewMonsterName(e.target.value)}
              className="mb-2"
            />
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                max="20"
                value={monsterQuantity}
                onChange={(e) => setMonsterQuantity(Number(e.target.value) || 1)}
                className="w-20"
              />
              
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => addMonster()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="max-h-40 overflow-y-auto">
            {/* {monsters.map(monster => (
              <div 
                key={monster.id}
                className="p-2 hover:bg-muted/50 rounded cursor-pointer flex justify-between items-center"
                onClick={() => {
                  setSelectedMonsterId(monster.id === selectedMonsterId ? null : monster.id);
                  setNewMonsterName(monster.name);
                }}
              >
                <div className="flex items-center">
                  <Checkbox 
                    checked={monster.id === selectedMonsterId}
                    onCheckedChange={() => {
                      setSelectedMonsterId(monster.id === selectedMonsterId ? null : monster.id);
                      setNewMonsterName(monster.name);
                    }}
                    className="mr-2"
                  />
                  <span>{monster.name}</span>
                </div>
                <Badge variant="outline">CR {monster.cr}</Badge>
              </div>
            ))} */}
            
            {/* {monsters.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                Нет доступных монстров в базе данных
              </div>
            )} */}
          </div>
        </div>
      </div>
    </Card>
  );
};
