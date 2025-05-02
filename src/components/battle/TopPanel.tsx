
import React from "react";
import { Button } from "@/components/ui/button";
import { BattleState } from "@/pages/PlayBattlePage";
import { Pause, Play, SkipForward, Users, Calendar, Swords } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

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
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];

  return (
    <div className="h-14 border-b border-border bg-muted/10 flex items-center justify-between px-4 z-10">
      <div className="flex items-center space-x-2">
        <div className="font-bold flex items-center" style={{ color: currentTheme.textColor }}>
          <Swords className="w-5 h-5 mr-2" />
          Панель Мастера
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {battleState.isActive ? (
          <>
            <div className="flex items-center mr-4" style={{ color: currentTheme.textColor }}>
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Раунд {battleState.round}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onPauseBattle}
              style={{ 
                color: currentTheme.textColor,
                borderColor: currentTheme.accent,
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
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
            <Button 
              size="sm" 
              variant="default" 
              onClick={onNextTurn}
              style={{ 
                color: currentTheme.textColor,
                backgroundColor: `rgba(${currentTheme.accent}, 0.7)`
              }}
            >
              <SkipForward className="w-4 h-4 mr-1" /> Следующий ход
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            variant="default" 
            onClick={onStartBattle}
            style={{ 
              color: currentTheme.textColor,
              backgroundColor: `rgba(${currentTheme.accent}, 0.7)`
            }}
          >
            <Swords className="w-4 h-4 mr-1" /> Начать бой
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopPanel;
