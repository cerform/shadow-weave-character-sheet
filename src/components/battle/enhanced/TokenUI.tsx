import React from 'react';
import { Html } from '@react-three/drei';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TokenUIProps {
  tokenId: string;
  position: [number, number, number];
}

export const TokenUI: React.FC<TokenUIProps> = ({ tokenId, position }) => {
  const { tokens, activeId } = useEnhancedBattleStore();
  
  const token = tokens.find(t => t.id === tokenId);
  if (!token || token.isVisible === false) return null;
  
  const isActive = token.id === activeId;
  const hpPercentage = (token.hp / token.maxHp) * 100;

  return (
    <Html
      center
      distanceFactor={12}
      transform={false}
      sprite
      position={[position[0], position[1] + 2, position[2]]} // Float above character
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div className="text-center space-y-1">
        {/* Token name */}
        <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-white font-semibold text-sm">
            {token.name}
          </span>
          {isActive && (
            <Badge variant="secondary" className="ml-1 text-xs">
              Ход
            </Badge>
          )}
        </div>

        {/* HP bar */}
        <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full min-w-20">
          <div className="flex items-center gap-2">
            <Progress
              value={hpPercentage}
              className="h-1 flex-1"
            />
            <span className="text-white text-xs font-mono">
              {token.hp}/{token.maxHp}
            </span>
          </div>
        </div>

        {/* Conditions */}
        {token.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {token.conditions.map((condition, idx) => (
              <Badge
                key={idx}
                variant="destructive"
                className="text-xs px-1 py-0"
              >
                {condition}
              </Badge>
            ))}
          </div>
        )}

        {/* AC display */}
        <div className="bg-slate-700/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className="text-slate-200 text-xs">
            AC {token.ac}
          </span>
        </div>
      </div>
    </Html>
  );
};