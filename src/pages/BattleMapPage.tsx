import React from 'react';
import { useParams } from 'react-router-dom';
import BattleMapUI from '@/components/BattleMapUI';

const BattleMapPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="h-screen w-screen bg-background overflow-hidden">
      <BattleMapUI sessionId={sessionId} />
    </div>
  );
};

export default BattleMapPage;