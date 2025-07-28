import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleBattleMapProps {
  isDM?: boolean;
}

const SimpleBattleMap: React.FC<SimpleBattleMapProps> = ({ isDM = false }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Battle Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center">
            <p className="text-slate-400">Battle Map Area</p>
          </div>
          {isDM && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">DM Controls</h3>
              <p className="text-slate-300">DM tools and controls will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleBattleMap;