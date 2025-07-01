
import React from 'react';
import PlayerSessionPanel from '@/components/session/PlayerSessionPanel';

const JoinSessionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto py-6">
        <PlayerSessionPanel />
      </div>
    </div>
  );
};

export default JoinSessionPage;
