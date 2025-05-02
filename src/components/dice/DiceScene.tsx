
import React, { useState } from 'react';
import { DiceRenderer } from './DiceRenderer';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DiceSceneProps {
  initialDiceType?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  hideControls?: boolean;
  height?: number;
}

export const DiceScene: React.FC<DiceSceneProps> = ({
  initialDiceType = 'd20',
  hideControls = false,
  height = 300
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [rollResult, setRollResult] = useState<number | null>(null);

  const handleRollComplete = (result: number) => {
    setRollResult(result);
    
    // Reset result after a few seconds
    setTimeout(() => {
      setRollResult(null);
    }, 3000);
  };

  return (
    <Card className="relative">
      <CardContent className="p-0">
        <DiceRenderer 
          initialDiceType={initialDiceType}
          height={height}
          hideControls={hideControls}
          onRollComplete={handleRollComplete}
        />
        
        {rollResult !== null && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10
                       bg-black/70 backdrop-blur-sm rounded-xl p-4 text-center"
            style={{ color: currentTheme.accent }}
          >
            <div className="text-5xl font-bold">{rollResult}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiceScene;
