import React, { useState, useRef } from "react";
import { LeftPanel } from "@/components/battle/LeftPanel";
import BattleMap from "@/components/battle/BattleMap";
import RightPanel from "@/components/battle/RightPanel";
import BottomPanel from "@/components/battle/BottomPanel";
import TopPanel from "@/components/battle/TopPanel";
import { motion } from "framer-motion";
import { Dice1, Pause, Play, Plus, SkipForward, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Типы для управления битвой
export interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "npc" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
  resources: { [key: string]: number };
  spellSlots?: { [key: string]: { used: number; max: number } };
  visible: boolean; // видимость для игроков
}

export interface Initiative {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface BattleState {
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
}

const PlayBattlePage = () => {
  // Состояния для управления боем
  const [tokens, setTokens] = useState<Token[]>([]);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    round: 0,
    currentInitiativeIndex: -1,
  });
  const [mapBackground, setMapBackground] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [showWebcams, setShowWebcams] = useState<boolean>(true);
  
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);

  // Обработчики для управления боем
  const startBattle = () => {
    if (tokens.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нельзя начать сражение без участников",
        variant: "destructive",
      });
      return;
    }
    
    rollInitiative();
    setBattleState({
      isActive: true,
      round: 1,
      currentInitiativeIndex: 0,
    });
    
    toast({
      title: "Бой начался!",
      description: `Раунд 1: ${initiative[0]?.name} ходит первым`,
    });
  };

  const pauseBattle = () => {
    setBattleState(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));
    
    toast({
      title: battleState.isActive ? "Бой на паузе" : "Бой продолжается",
    });
  };

  const nextTurn = () => {
    if (!battleState.isActive || initiative.length === 0) return;
    
    let nextIndex = (battleState.currentInitiativeIndex + 1) % initiative.length;
    let newRound = battleState.round;
    
    if (nextIndex === 0) {
      newRound++;
    }
    
    // Обновляем активный статус участников инициативы
    const updatedInitiative = initiative.map((item, idx) => ({
      ...item,
      isActive: idx === nextIndex,
    }));
    
    setInitiative(updatedInitiative);
    setBattleState({
      ...battleState,
      round: newRound,
      currentInitiativeIndex: nextIndex,
    });
    
    const currentToken = tokens.find(t => t.id === updatedInitiative[nextIndex].tokenId);
    toast({
      title: nextIndex === 0 ? `Начался раунд ${newRound}!` : "Следующий ход",
      description: `${currentToken?.name || 'Неизвестный'} ходит`,
    });
  };

  const rollInitiative = () => {
    if (tokens.length === 0) return;
    
    const initiativeRolls = tokens.map(token => {
      // Генерируем бросок d20 + модификатор инициативы
      const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(token.initiative);
      
      return {
        id: Date.now() + token.id,
        tokenId: token.id,
        name: token.name,
        roll,
        isActive: false,
      };
    });
    
    // Сортируем по результату инициативы (от большего к меньшему)
    const sortedInitiative = [...initiativeRolls].sort((a, b) => b.roll - a.roll);
    
    // Устанавливаем первого участника активным
    if (sortedInitiative.length > 0) {
      sortedInitiative[0].isActive = true;
    }
    
    setInitiative(sortedInitiative);
  };

  // Обработчик для перетаскивания токенов
  const handleUpdateTokenPosition = (id: number, x: number, y: number) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, x, y } : token
    ));
  };

  // Обработчик для выбора токена
  const handleSelectToken = (id: number | null) => {
    setSelectedTokenId(id);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Верхняя панель */}
      <TopPanel 
        battleState={battleState}
        onStartBattle={startBattle}
        onPauseBattle={pauseBattle}
        onNextTurn={nextTurn}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель */}
        <LeftPanel 
          tokens={tokens} 
          setTokens={setTokens} 
          initiative={initiative}
          setInitiative={setInitiative}  // Передаем setInitiative как обязательный параметр
          selectedTokenId={selectedTokenId}
          onSelectToken={handleSelectToken}
          battleState={battleState}
        />
        
        {/* Центральная карта */}
        <div className="flex-1 relative overflow-hidden">
          <BattleMap 
            tokens={tokens}
            setTokens={setTokens}
            background={mapBackground}
            setBackground={setMapBackground}
            onUpdateTokenPosition={handleUpdateTokenPosition}
            onSelectToken={handleSelectToken}
            selectedTokenId={selectedTokenId}
            initiative={initiative}
            battleActive={battleState.isActive}
          />
        </div>
        
        {/* Правая панель */}
        <RightPanel
          selectedTokenId={selectedTokenId} 
          tokens={tokens}
          setTokens={setTokens}
        />
      </div>
      
      {/* Нижняя панель */}
      <BottomPanel 
        showWebcams={showWebcams} 
        setShowWebcams={setShowWebcams} 
      />
    </div>
  );
};

export default PlayBattlePage;
