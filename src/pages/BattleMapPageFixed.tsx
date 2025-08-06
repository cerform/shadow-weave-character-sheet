import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import SimpleBattleMap from '@/components/battle/SimpleBattleMap';

const BattleMapPageFixed: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">Боевая карта (Новая система)</h1>
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
        <SimpleBattleMap isDM={true} />
      </div>
    </div>
  );
};

export default BattleMapPageFixed;