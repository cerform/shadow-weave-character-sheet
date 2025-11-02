import React from 'react';
import { useParams } from 'react-router-dom';
import BattleMapUI from '@/components/BattleMapUI';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const BattleMapPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Некорректный ID сессии</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen bg-background overflow-hidden">
        <BattleMapUI sessionId={sessionId} />
      </div>
    </ErrorBoundary>
  );
};

export default BattleMapPage;