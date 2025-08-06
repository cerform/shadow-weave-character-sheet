import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Map, Upload } from 'lucide-react';
import InteractiveBattleMap from '@/components/battle/InteractiveBattleMap';

const BattleMapPageFixed: React.FC = () => {
  console.log('BattleMapPageFixed: компонент загружается');
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">Боевая карта</h1>
          <Button 
            onClick={() => navigate('/battle-map-3d')}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            Переключить на 3D
          </Button>
        </div>
      </div>

      {/* Карта на весь экран */}
      <InteractiveBattleMap isDM={true} />
    </div>
  );
};

export default BattleMapPageFixed;