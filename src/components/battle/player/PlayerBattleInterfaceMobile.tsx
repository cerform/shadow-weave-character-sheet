import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerProfile } from './PlayerProfile';
import { PlayerActionsPanel } from './PlayerActionsPanel';
import { PlayerTokensList } from './PlayerTokensList';
import { CombatLogMini } from './CombatLogMini';
import BattleMap2DPlayer from '../BattleMap2DPlayer';
import { EnhancedToken, useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Users, User, Scroll, X, ChevronUp, Home } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlayerBattleInterfaceMobileProps {
  sessionId: string;
  sessionCode?: string;
}

export const PlayerBattleInterfaceMobile: React.FC<PlayerBattleInterfaceMobileProps> = ({
  sessionId,
  sessionCode
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tokens, mapImageUrl, addToken, updateToken, combatLog } = useEnhancedBattleStore();
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('actions');

  const playerToken = tokens.find(t => t.owner_id === user?.id && !t.is_summoned);
  const visibleTokens = tokens.filter(t => 
    t.isVisible && (!t.isEnemy || t.owner_id === user?.id)
  );

  const handleAvatarUpdate = (url: string) => {
    if (playerToken) {
      updateToken(playerToken.id, { avatarUrl: url, image_url: url });
    }
  };

  const handleAction = (actionType: string, data?: any) => {
    console.log('Player action:', actionType, data);
  };

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Верхняя панель с меню */}
      <div className="flex items-center justify-between p-2 bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Профиль и группа</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4 space-y-4">
                <PlayerProfile
                  token={playerToken}
                  sessionId={sessionId}
                  onAvatarUpdate={handleAvatarUpdate}
                />
                
                {sessionCode && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Код сессии:
                    </div>
                    <div className="font-mono font-bold text-center">
                      {sessionCode}
                    </div>
                  </div>
                )}

                <PlayerTokensList
                  tokens={visibleTokens}
                  currentToken={playerToken}
                />
              </div>
            </ScrollArea>
          </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          {playerToken && (
            <div className="flex items-center gap-2 text-sm">
              <div className="font-semibold truncate max-w-[120px]">
                {playerToken.name}
              </div>
              <div className="text-xs text-muted-foreground">
                HP: {playerToken.hp}/{playerToken.maxHp}
              </div>
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowBottomPanel(!showBottomPanel)}
        >
          {showBottomPanel ? <X className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>

      {/* Карта - полный экран */}
      <div className="flex-1 relative">
        <BattleMap2DPlayer
          sessionId={sessionId}
          mapImageUrl={mapImageUrl}
          tokens={visibleTokens}
        />
      </div>

      {/* Нижняя выдвижная панель */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-background border-t border-border transition-transform duration-300 z-40 ${
          showBottomPanel ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'
        }`}
        style={{ maxHeight: '60vh' }}
      >
        {/* Хэндл для свайпа */}
        <div 
          className="h-12 flex items-center justify-center cursor-pointer"
          onClick={() => setShowBottomPanel(!showBottomPanel)}
        >
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="actions" className="gap-2">
              <Menu className="h-4 w-4" />
              Действия
            </TabsTrigger>
            <TabsTrigger value="party" className="gap-2">
              <Users className="h-4 w-4" />
              Группа
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-2">
              <Scroll className="h-4 w-4" />
              Лог
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(60vh-8rem)]">
            <TabsContent value="actions" className="m-0 p-2">
              <PlayerActionsPanel
                token={playerToken}
                sessionId={sessionId}
                onAction={handleAction}
                onSummon={addToken}
              />
            </TabsContent>

            <TabsContent value="party" className="m-0 p-4">
              <PlayerTokensList
                tokens={visibleTokens}
                currentToken={playerToken}
              />
            </TabsContent>

            <TabsContent value="log" className="m-0 p-0">
              <CombatLogMini events={combatLog} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};
