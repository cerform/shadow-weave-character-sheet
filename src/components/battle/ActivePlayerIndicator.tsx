
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Token } from '@/stores/battleStore';

interface ActivePlayerIndicatorProps {
  activePlayer: Token | null;
  isYourTurn: boolean;
}

const ActivePlayerIndicator: React.FC<ActivePlayerIndicatorProps> = ({ 
  activePlayer,
  isYourTurn
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  if (!activePlayer) {
    return null;
  }
  
  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className={`
          px-4 py-2 rounded-lg shadow-lg flex items-center gap-3
          animate-pulse transition-all duration-300
          ${isYourTurn ? 'bg-green-500/80' : 'bg-blue-500/80'} 
          backdrop-blur-sm
        `}
      >
        {activePlayer.img && (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/60">
            <img 
              src={String(activePlayer.img || '')} 
              alt={String(activePlayer.name || 'Player')} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-white font-bold">{String(activePlayer.name || 'Player')}</span>
          <span className="text-white/80 text-xs">
            {isYourTurn ? 'Ваш ход!' : 'Текущий ход'}
          </span>
        </div>
        <Badge 
          variant="outline" 
          className="ml-2"
          style={{
            backgroundColor: currentTheme.accent,
            color: '#fff',
            borderColor: 'rgba(255,255,255,0.5)'
          }}
        >
          {String(activePlayer.type || '')}
        </Badge>
      </div>
    </div>
  );
};

export default ActivePlayerIndicator;
