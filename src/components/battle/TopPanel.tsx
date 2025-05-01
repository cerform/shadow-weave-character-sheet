
import React from "react";
import { Button } from "@/components/ui/button";
import { BattleState } from "@/pages/PlayBattlePage";
import { Pause, Play, Plus, SkipForward, Users, Calendar, Swords } from "lucide-react";

interface TopPanelProps {
  battleState: BattleState;
  onStartBattle: () => void;
  onPauseBattle: () => void;
  onNextTurn: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  battleState,
  onStartBattle,
  onPauseBattle,
  onNextTurn,
}) => {
  return (
    <div className="h-14 border-b border-border bg-muted/10 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <div className="font-bold flex items-center">
          <Swords className="w-5 h-5 mr-2" />
          Панель Мастера
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {battleState.isActive ? (
          <>
            <div className="flex items-center mr-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Раунд {battleState.round}</span>
            </div>
            <Button size="sm" variant="outline" onClick={onPauseBattle}>
              {battleState.isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-1" /> Пауза
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" /> Продолжить
                </>
              )}
            </Button>
            <Button size="sm" variant="default" onClick={onNextTurn}>
              <SkipForward className="w-4 h-4 mr-1" /> Следующий ход
            </Button>
          </>
        ) : (
          <Button size="sm" variant="default" onClick={onStartBattle}>
            <Swords className="w-4 h-4 mr-1" /> Начать бой
          </Button>
        )}

        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Добавить существо
        </Button>
        
        <Button size="sm" variant="outline">
          <Users className="w-4 h-4 mr-1" /> Управление игроками
        </Button>
      </div>
    </div>
  );
};

export default TopPanel;
