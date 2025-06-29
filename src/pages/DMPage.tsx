
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DMSessionManager from '@/components/session/DMSessionManager';
import { ArrowLeft } from 'lucide-react';

const DMPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Button>
          <h1 className="text-3xl font-bold text-white">Панель Мастера</h1>
        </div>

        <DMSessionManager onSessionEnd={() => navigate('/')} />
      </div>
    </div>
  );
};

export default DMPage;
