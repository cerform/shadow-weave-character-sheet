import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Map, ArrowLeft } from 'lucide-react';
import BattleMap3D from '@/components/battle/BattleMap3D';

const BattleMap3DPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              3D Боевая карта
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Кнопка возврата */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          onClick={() => navigate('/battle-map-fixed')}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          К 2D карте
        </Button>
      </div>

      {/* Кнопка домой */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Главная
        </Button>
      </div>

      {/* 3D карта */}
      <div className="w-full h-screen">
        <BattleMap3D isDM={true} />
      </div>
    </div>
  );
};

export default BattleMap3DPage;