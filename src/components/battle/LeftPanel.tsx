
// В LeftPanel.tsx нужно исправить ошибку с типом initiative, чтобы оно всегда было числом
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Sword, Shield, ZapFast, PlusCircle, MinusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Вспомогательные компоненты и утилиты
import { MonsterCard } from './MonsterCard';
import { useToast } from '@/hooks/use-toast';

// Типы данных
interface Condition {
  name: string;
  duration: number | null;
}

interface Combatant {
  id: string;
  name: string;
  type: 'character' | 'monster' | 'npc';
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number; // Убедимся что тип всегда number, не string
  conditions: Condition[];
  resources?: Record<string, { current: number; max: number }>;
  visible: boolean;
}

interface Monster {
  id: string;
  name: string;
  type: string;
  hp: number;
  ac: number;
  cr: string;
  abilities: Record<string, number>;
}

interface LeftPanelProps {
  combatants: Combatant[];
  setCombatants: React.Dispatch<React.SetStateAction<Combatant[]>>;
  monsters: Monster[];
  currentTurn: number;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
  isCombatActive: boolean;
  setIsCombatActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  combatants,
  setCombatants,
  monsters,
  currentTurn,
  setCurrentTurn,
  isCombatActive,
  setIsCombatActive,
}) => {
  const { toast } = useToast();
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [monsterQuantity, setMonsterQuantity] = useState(1);
  const [newMonsterName, setNewMonsterName] = useState('');

  // Обработчики для управления боевым порядком
  const startCombat = () => {
    if (combatants.length < 1) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одного участника в бой",
        variant: "destructive",
      });
      return;
    }

    // Сортируем участников по инициативе (от большей к меньшей)
    const sortedCombatants = [...combatants].sort(
      (a, b) => b.initiative - a.initiative
    );

    setCombatants(sortedCombatants);
    setCurrentTurn(0);
    setIsCombatActive(true);

    toast({
      title: "Бой начался!",
      description: `Ход ${sortedCombatants[0]?.name || "первого участника"}`,
    });
  };

  const endCombat = () => {
    setIsCombatActive(false);
    setCurrentTurn(0);
    toast({
      title: "Бой завершен",
      description: "Инициатива сброшена",
    });
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    
    const nextTurn = (currentTurn + 1) % combatants.length;
    setCurrentTurn(nextTurn);
    
    toast({
      title: "Следующий ход",
      description: `Ход ${combatants[nextTurn]?.name || "следующего участника"}`,
    });
  };

  // Добавление монстра в бой
  const addMonster = (monster: Monster | null = null) => {
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
    const newCombatants: Combatant[] = [];
    
    for (let i = 0; i < monsterQuantity; i++) {
      newCombatants.push({
        id: `${baseMonster.id}-${Date.now()}-${i}`,
        name: monsterQuantity > 1 ? `${baseMonster.name} ${i + 1}` : baseMonster.name,
        type: 'monster',
        hp: baseMonster.hp,
        maxHp: baseMonster.hp,
        ac: baseMonster.ac,
        // Fix: Ensure initiative is always a number by parsing to number or using default 0
        initiative: Math.floor(Math.random() * 20) + 1,
        conditions: [],
        resources: {},
        visible: true
      });
    }
    
    setCombatants([...combatants, ...newCombatants]);
    
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
  const removeCombatant = (id: string) => {
    setCombatants(combatants.filter(c => c.id !== id));
    
    // Если удаляем активного участника, переходим к следующему
    if (isCombatActive && combatants[currentTurn]?.id === id) {
      nextTurn();
    }
  };

  // Обновление хитпоинтов участника
  const updateCombatantHP = (id: string, change: number) => {
    setCombatants(combatants.map(c => {
      if (c.id === id) {
        const newHP = Math.max(0, Math.min(c.maxHp, c.hp + change));
        return { ...c, hp: newHP };
      }
      return c;
    }));
  };

  // Функция для отображения списка участников боя
  const renderCombatants = () => {
    if (combatants.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          Нет участников боя. Добавьте персонажей или монстров.
        </div>
      );
    }

    return combatants.map((combatant, index) => {
      const isCurrentTurn = isCombatActive && index === currentTurn;
      
      return (
        <div 
          key={combatant.id}
          className={`p-3 border rounded-md mb-2 ${isCurrentTurn ? 'bg-primary/10 border-primary' : ''}`}
        >
          <div className="flex justify-between items-center">
            <div className="font-medium">{combatant.name}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => removeCombatant(combatant.id)}
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
                  onClick={() => updateCombatantHP(combatant.id, -1)}
                >
                  <MinusCircle className="h-3 w-3" />
                </Button>
                <span className="mx-2">
                  {combatant.hp}/{combatant.maxHp}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => updateCombatantHP(combatant.id, 1)}
                >
                  <PlusCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground">AC</div>
              <div className="mt-1">{combatant.ac}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Инициатива</div>
              <div className="mt-1">{combatant.initiative}</div>
            </div>
          </div>
          
          {combatant.conditions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Состояния:</div>
              <div className="flex flex-wrap gap-1">
                {combatant.conditions.map((condition, i) => (
                  <Badge key={i} variant="outline">
                    {condition.name}
                    {condition.duration && ` (${condition.duration})`}
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
            onClick={isCombatActive ? endCombat : startCombat} 
            variant={isCombatActive ? "destructive" : "default"}
            className="flex-1"
          >
            {isCombatActive ? "Завершить бой" : "Начать бой"}
          </Button>
          
          {isCombatActive && (
            <Button onClick={nextTurn} variant="outline">
              Следующий ход
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {renderCombatants()}
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
            {monsters.map(monster => (
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
            ))}
            
            {monsters.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                Нет доступных монстров в базе данных
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
