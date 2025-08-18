import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Settings, RotateCcw, Building, Map } from 'lucide-react';
import { EnhancedBattleMap } from '@/components/battle/enhanced/EnhancedBattleMap';
import { BattleHUD } from '@/components/battle/enhanced/BattleHUD';
import { EquipmentPanel } from '@/components/battle/enhanced/EquipmentPanel';
import WorldEditor from '@/components/world/WorldEditor';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

const EnhancedBattleScene: React.FC = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const [mode, setMode] = useState<'battle' | 'build'>('battle');
  
  const {
    currentRound,
    combatStarted,
    activeId,
    tokens,
  } = useEnhancedBattleStore();
  
  const { initializeSync, disconnectSync, setIsDM } = useFogOfWarStore();

  const activeToken = tokens.find(t => t.id === activeId);

  // Initialize fog sync and DM mode
  useEffect(() => {
    setIsDM(true);
    
    if (sessionId) {
      initializeSync(sessionId);
      console.log('🌫️ Enhanced battle scene: fog sync initialized for session:', sessionId);
    }
    
    return () => {
      if (sessionId) {
        disconnectSync();
      }
    };
  }, [sessionId, initializeSync, disconnectSync, setIsDM]);

  // Set page title
  useEffect(() => {
    document.title = `Боевая сцена - Раунд ${currentRound}`;
  }, [currentRound]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-600">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-amber-400">
                Shadow Weave
              </h1>
              <div className="text-sm text-slate-300">
                Боевая сцена D&D 5e
              </div>
            </div>
            
            <div className="h-6 w-px bg-slate-600" />
            
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                Раунд {currentRound}
              </div>
              <div className="text-sm text-slate-400">
                {combatStarted ? (activeToken ? `Ход: ${activeToken.name}` : 'Бой идёт') : 'Подготовка'}
              </div>
            </div>
            
            <div className="h-6 w-px bg-slate-600" />
            
            <div className="flex gap-2">
              <Button
                onClick={() => setMode('battle')}
                variant={mode === 'battle' ? 'default' : 'outline'}
                size="sm"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Map className="w-4 h-4 mr-2" />
                Бой
              </Button>
              
              <Button
                onClick={() => setMode('build')}
                variant={mode === 'build' ? 'default' : 'outline'}
                size="sm"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Building className="w-4 h-4 mr-2" />
                Строительство
              </Button>
              
              <Button
                onClick={() => navigate('/dm')}
                variant="outline"
                size="sm"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Панель DM
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      {mode === 'battle' ? (
        <>
          <div className="w-full h-full pt-20 pb-4">
            <EnhancedBattleMap />
          </div>
          {/* UI оверлеи только в режиме боя */}
          <div className="absolute top-20 right-4 z-30">
            <BattleHUD />
          </div>
          <div className="absolute bottom-4 right-4 z-30">
            <EquipmentPanel />
          </div>
        </>
      ) : (
        <div className="w-full h-full pt-20">
          <WorldEditor />
        </div>
      )}

      {/* Status bar */}
      <div className="absolute bottom-4 right-1/2 transform translate-x-1/2 z-40">
        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-600">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400">Система активна</span>
            </div>
            
            <div className="h-4 w-px bg-slate-600" />
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-blue-400">
                {sessionId ? 'Мультиплеер' : 'Локальная игра'}
              </span>
            </div>
            
            <div className="h-4 w-px bg-slate-600" />
            
            <div className="text-slate-400">
              Токенов: {tokens.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBattleScene;