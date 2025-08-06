import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import SmoothBattleMap, { Token } from '@/components/battle/SmoothBattleMap';

const BattleMapPageFixed: React.FC = () => {
  console.log('🔍 BattleMapPageFixed: компонент загружается');
  const navigate = useNavigate();
  
  // Состояние для токенов и карты
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 'player1',
      name: 'Fighter',
      x: 100,
      y: 100,
      color: '#3b82f6',
      size: 50,
      hp: 45,
      maxHp: 45,
      ac: 18,
      speed: 30,
      type: 'player',
      controlledBy: 'player1'
    },
    {
      id: 'goblin1',
      name: 'Goblin',
      x: 300,
      y: 200,
      color: '#ef4444',
      size: 40,
      hp: 7,
      maxHp: 12,
      ac: 15,
      speed: 30,
      type: 'monster',
      controlledBy: 'dm'
    },
    {
      id: 'wizard1',
      name: 'Wizard',
      x: 150,
      y: 300,
      color: '#8b5cf6',
      size: 45,
      hp: 28,
      maxHp: 28,
      ac: 12,
      speed: 30,
      type: 'player',
      controlledBy: 'player2'
    }
  ]);
  
  const [mapUrl, setMapUrl] = useState<string>('');

  console.log('🔍 BattleMapPageFixed: tokens count:', tokens.length);
  console.log('🔍 BattleMapPageFixed: tokens:', tokens);

  const handleTokensChange = (newTokens: Token[]) => {
    console.log('🔄 BattleMapPageFixed: токены изменились:', newTokens);
    setTokens(newTokens);
  };

  return (
    <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">Боевая карта (Рабочая версия)</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/battle-map-3d')}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              Переключить на 3D
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="bg-slate-600 hover:bg-slate-700"
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Домой
            </Button>
          </div>
        </div>
      </div>

      {/* Карта на весь экран */}
      <div className="w-full h-full pt-16">
        <SmoothBattleMap
          isDM={true}
          tokens={tokens}
          onTokensChange={handleTokensChange}
          mapImageUrl={mapUrl}
          onMapChange={setMapUrl}
        />
      </div>
    </div>
  );
};

export default BattleMapPageFixed;