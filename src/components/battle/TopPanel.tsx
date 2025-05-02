
import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward, Image, Home, ArrowLeft, Grid, Eye, EyeOff, ZoomIn, ZoomOut, X, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigationButtons from "@/components/ui/NavigationButtons";

interface BattleState {
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
}

interface TopPanelProps {
  battleState: BattleState;
  onStartBattle: () => void;
  onPauseBattle: () => void;
  onNextTurn: () => void;
  onUploadBackground?: () => void;
  isDM?: boolean;
  // Добавляем новые пропсы для управления картой
  onToggleGrid?: () => void;
  gridVisible?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  zoomLevel?: number;
  onToggleFogOfWar?: () => void;
  fogOfWar?: boolean;
}

const TopPanel: React.FC<TopPanelProps> = ({
  battleState,
  onStartBattle,
  onPauseBattle,
  onNextTurn,
  onUploadBackground,
  isDM = true,
  // Новые пропсы
  onToggleGrid,
  gridVisible = true,
  onZoomIn,
  onZoomOut,
  zoomLevel = 100,
  onToggleFogOfWar,
  fogOfWar = false,
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

      <div className="flex items-center gap-2">
        {/* Управление боем */}
        {isDM && (
          <>
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
          </>
        )}

        {/* Новая группа кнопок управления картой */}
        <div className="flex items-center gap-1 border-l border-muted pl-2 ml-2">
          {/* Сетка */}
          {onToggleGrid && (
            <Button 
              variant={gridVisible ? "default" : "outline"} 
              size="icon" 
              className="h-8 w-8" 
              onClick={onToggleGrid}
              title={gridVisible ? "Скрыть сетку" : "Показать сетку"}
            >
              <Grid size={16} />
            </Button>
          )}
          
          {/* Туман войны */}
          {isDM && onToggleFogOfWar && (
            <Button 
              variant={fogOfWar ? "default" : "outline"} 
              size="icon" 
              className="h-8 w-8" 
              onClick={onToggleFogOfWar}
              title={fogOfWar ? "Выключить туман войны" : "Включить туман войны"}
            >
              {fogOfWar ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          )}
          
          {/* Зум */}
          {onZoomIn && onZoomOut && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onZoomOut}
                title="Уменьшить"
              >
                <ZoomOut size={16} />
              </Button>
              
              <div className="text-xs px-1 min-w-[40px] text-center">
                {zoomLevel}%
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onZoomIn}
                title="Увеличить"
              >
                <ZoomIn size={16} />
              </Button>
            </>
          )}
          
          {/* Загрузка карты */}
          {isDM && onUploadBackground && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={onUploadBackground}
              className="h-8 w-8"
              title="Загрузить карту"
            >
              <Map size={16} />
            </Button>
          )}
        </div>
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
