import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { monsterAvatars } from '@/data/monsterAvatars';

const AvatarGallery: React.FC = () => {
  return (
    <Card className="bg-slate-800/90 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-sm">🎭 Галерея 2D аватаров</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(monsterAvatars).map(([key, avatar]) => (
            <div 
              key={key} 
              className="flex items-center gap-2 p-2 bg-slate-700/50 rounded text-xs"
              style={{ backgroundColor: `${avatar.backgroundColor}20` }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: avatar.backgroundColor, color: avatar.color }}
              >
                {avatar.emoji}
              </div>
              <div className="text-white">
                <div className="font-medium">{avatar.name}</div>
                <div className="text-slate-400 text-xs">{key}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarGallery;