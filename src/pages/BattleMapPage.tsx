import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

const BattleMapPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleBack = () => {
    if (sessionId) {
      navigate(`/battle/${sessionId}`);
    } else {
      navigate('/dm');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Верхняя панель управления */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-semibold">Боевая карта</h1>
          {sessionId && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
              Сессия: {sessionId}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Выйти из полноэкранного режима
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Полноэкранный режим
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Основная область карты */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Боевая карта</h2>
            <p className="text-muted-foreground mb-4">
              {sessionId ? `Сессия: ${sessionId}` : 'Тренировочный режим'}
            </p>
            <div className="w-96 h-64 bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Здесь будет интерактивная карта</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleMapPage;