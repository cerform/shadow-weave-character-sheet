
import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward, Image, Home, ArrowLeft } from "lucide-react";
import { BattleState } from "@/pages/PlayBattlePage";
import { useNavigate } from "react-router-dom";
import NavigationButtons from "@/components/ui/NavigationButtons";

interface TopPanelProps {
  battleState: BattleState;
  onStartBattle: () => void;
  onPauseBattle: () => void;
  onNextTurn: () => void;
  onUploadBackground?: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  battleState,
  onStartBattle,
  onPauseBattle,
  onNextTurn,
  onUploadBackground,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center p-2 h-14">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => navigate("/")}
        >
          <Home size={16} />
          Главная
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Назад
        </Button>
      </div>

      <div className="flex gap-2">
        {!battleState.isActive && battleState.round === 0 ? (
          <Button 
            onClick={onStartBattle}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play size={16} className="mr-1" />
            Начать бой
          </Button>
        ) : (
          <>
            <Button onClick={onPauseBattle}>
              {battleState.isActive ? (
                <>
                  <Pause size={16} className="mr-1" />
                  Пауза
                </>
              ) : (
                <>
                  <Play size={16} className="mr-1" />
                  Продолжить
                </>
              )}
            </Button>
            <Button 
              onClick={onNextTurn}
              disabled={!battleState.isActive}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <SkipForward size={16} className="mr-1" />
              Следующий ход
            </Button>
          </>
        )}

        {onUploadBackground && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUploadBackground}
          >
            <Image size={16} className="mr-1" />
            Загрузить карту
          </Button>
        )}
      </div>

      <div className="flex items-center">
        <div className="mr-4 font-semibold">
          {battleState.round > 0 && (
            <span>Раунд: {battleState.round}</span>
          )}
        </div>
        <NavigationButtons className="!flex-row" />
      </div>
    </div>
  );
};

export default TopPanel;
