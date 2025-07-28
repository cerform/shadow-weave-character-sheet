import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Map,
  Users,
  Swords,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import BattleMapPanel from '@/components/battle/BattleMapPanel';

const BattleMapPageFixed: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const isDM = true; // Для этой страницы всегда DM

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, navigate]);

  const goBack = () => {
    if (sessionId) {
      navigate(`/dm/session/${sessionId}`);
    } else {
      navigate('/dm');
    }
  };

  return (
    <BackgroundWrapper>
      <div className="h-screen flex flex-col">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between p-4 bg-background/95 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <h1 className="text-xl font-bold">Боевая карта</h1>
              {sessionId && (
                <Badge variant="outline">Сессия: {sessionId}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Maximize2 className="h-4 w-4" />
              Полный экран
            </Button>
          </div>
        </div>

        {/* Основная область с BattleMapPanel */}
        <div className="flex-1 p-4">
          <BattleMapPanel
            isDM={isDM}
            sessionId={sessionId}
          />
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default BattleMapPageFixed;