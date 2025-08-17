import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import BattleSidebar from './BattleSidebar';
import Simple2DMapFromAssets from './Simple2DMapFromAssets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Maximize } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface BattleMapWithSidebarProps {
  isDM?: boolean;
}

const BattleMapWithSidebar: React.FC<BattleMapWithSidebarProps> = ({ isDM = false }) => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [selectedTool, setSelectedTool] = useState('select');
  const [tokens, setTokens] = useState<any[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState<string>('');

  const handleBackClick = () => {
    if (sessionId) {
      navigate(isDM ? `/dm-session/${sessionId}` : `/player-session/${sessionId}`);
    } else {
      navigate('/');
    }
  };

  const handleAddToken = () => {
    const newToken = {
      id: `token_${Date.now()}`,
      name: `Токен ${tokens.length + 1}`,
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150,
      color: '#3b82f6',
      size: 1,
      type: 'npc',
      hp: 100,
      maxHp: 100
    };
    setTokens(prev => [...prev, newToken]);
  };

  const handleAddAllTokens = () => {
    const playerTokens = [
      { name: 'Воин', color: '#ef4444', type: 'player', hp: 120, maxHp: 120 },
      { name: 'Маг', color: '#3b82f6', type: 'player', hp: 80, maxHp: 80 },
      { name: 'Разбойник', color: '#10b981', type: 'player', hp: 95, maxHp: 95 },
      { name: 'Клерик', color: '#f59e0b', type: 'player', hp: 110, maxHp: 110 }
    ];

    const newTokens = playerTokens.map((token, index) => ({
      id: `player_${Date.now()}_${index}`,
      ...token,
      x: 300 + (index * 60),
      y: 300,
      size: 1
    }));

    setTokens(prev => [...prev, ...newTokens]);
  };

  const handleClearTokens = () => {
    setTokens([]);
  };

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Заголовок с глобальным триггером */}
        <div className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="ml-2" />
            <Button onClick={handleBackClick} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Карта боя</h1>
            {sessionId && (
              <Badge variant="outline">Сессия: {sessionId}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mr-4">
            <Button onClick={handleFullscreen} variant="ghost" size="sm">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Основной контент с сайдбаром */}
        <div className="flex w-full pt-12">
          <BattleSidebar
            isDM={isDM}
            tokens={tokens}
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            onAddToken={handleAddToken}
            onAddAllTokens={handleAddAllTokens}
            onClearTokens={handleClearTokens}
          />

          <main className="flex-1 p-4">
            <Simple2DMapFromAssets
              assets3D={[]}
              tokens={tokens}
              mapImageUrl={mapImageUrl}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BattleMapWithSidebar;