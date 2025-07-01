
import React from 'react';
import DMPanel from '@/components/session/DMPanel';

const DMPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto py-6">
        <DMPanel />
      </div>
    </div>
  );
};

export default DMPage;
