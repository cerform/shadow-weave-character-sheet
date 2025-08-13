import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getModelTypeFromTokenName, determineMonsterType } from '@/utils/tokenModelMapping';
import { monsterTypes } from '@/data/monsterTypes';

interface TokenModelDebuggerProps {
  tokens: Array<{
    id: string;
    name: string;
    type: string;
    monsterType?: string;
  }>;
}

const TokenModelDebugger: React.FC<TokenModelDebuggerProps> = ({ tokens }) => {
  return (
    <Card className="bg-slate-800/90 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-sm">🔍 Отладка соответствия моделей</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tokens.map((token) => {
          const suggestedModel = getModelTypeFromTokenName(token.name);
          const finalModel = determineMonsterType(token.name, token.type);
          const currentModel = token.monsterType;
          const hasRealModel = finalModel && monsterTypes[finalModel];
          
          return (
            <div key={token.id} className="p-2 bg-slate-700/50 rounded text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium">{token.name}</span>
                <Badge variant={hasRealModel ? "default" : "destructive"} className="text-xs">
                  {hasRealModel ? "✅ 3D модель" : "❌ Кубик"}
                </Badge>
              </div>
              
              <div className="space-y-1 text-slate-300">
                <div>Тип токена: <span className="text-blue-300">{token.type}</span></div>
                <div>Текущая модель: <span className="text-yellow-300">{currentModel || 'не задана'}</span></div>
                <div>Предложенная модель: <span className="text-green-300">{suggestedModel || 'не найдена'}</span></div>
                <div>Финальная модель: <span className="text-purple-300">{finalModel}</span></div>
                
                {hasRealModel && (
                  <div className="text-green-400">
                    ✓ Будет отображаться как 3D модель {monsterTypes[finalModel].name}
                  </div>
                )}
                
                {!hasRealModel && (
                  <div className="text-red-400">
                    ⚠ Будет отображаться как простой кубик
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {tokens.length === 0 && (
          <div className="text-slate-400 text-center py-4">
            Нет токенов для отладки
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenModelDebugger;