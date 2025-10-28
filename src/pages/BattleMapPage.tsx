import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BattleMapUI from '@/components/BattleMapUI';

const BattleMapPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  // Автоматически переходим в полноэкранный режим при загрузке
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.log('Не удалось войти в полноэкранный режим:', error);
      }
    };

    enterFullscreen();

    // Выходим из полноэкранного режима при размонтировании компонента
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden">
      <BattleMapUI sessionId={sessionId} />
    </div>
  );
};

export default BattleMapPage;