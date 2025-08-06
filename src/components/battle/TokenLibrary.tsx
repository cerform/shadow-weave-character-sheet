import React from 'react';
import { defaultTokens, DefaultToken } from '@/data/defaultTokens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface TokenLibraryProps {
  onCreateToken: (template: DefaultToken) => void;
}

const TokenLibrary: React.FC<TokenLibraryProps> = ({ onCreateToken }) => {
  const typeColors: Record<string, string> = {
    monster: 'bg-red-500',
    beast: 'bg-orange-500',
    undead: 'bg-purple-500',
    construct: 'bg-gray-500',
    humanoid: 'bg-blue-500'
  };

  const sizeLabels: Record<number, string> = {
    0.5: 'Tiny',
    1: 'Medium',
    2: 'Large',
    3: 'Huge',
    4: 'Gargantuan'
  };

  return (
    <div className="space-y-4">
      <div className="text-white">
        <h3 className="text-lg font-semibold mb-2">Библиотека Токенов</h3>
        <p className="text-slate-400 text-sm">Выберите готовый шаблон для создания токена</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {defaultTokens.map((token) => (
          <Card 
            key={token.id} 
            className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-500 transition-colors"
            onClick={() => onCreateToken(token)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                  <img 
                    src={token.image} 
                    alt={token.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-sm">{token.name}</CardTitle>
                  <div className="flex gap-1 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`${typeColors[token.type]} text-white text-xs`}
                    >
                      {token.type}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                      {sizeLabels[token.size] || `${token.size}x`}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-400">
                  {token.suggestedHP && `HP: ${token.suggestedHP}`}
                  {token.suggestedHP && token.suggestedAC && ' • '}
                  {token.suggestedAC && `AC: ${token.suggestedAC}`}
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400 hover:text-green-300">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{token.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TokenLibrary;