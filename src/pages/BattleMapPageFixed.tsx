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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Боевая карта</h1>
          <Button 
            onClick={() => navigate('/battle-map-3d')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Переключить на 3D
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Map className="h-6 w-6" />
              Интерактивная боевая карта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveBattleMap isDM={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BattleMapPageFixed;