
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceD4 } from './DiceD4';
import { DiceD6 } from './DiceD6';
import { DiceD8 } from './DiceD8';
import { DiceD10 } from './DiceD10';
import { DiceD12 } from './DiceD12';
import { DiceD20 } from './DiceD20';
import { Button } from '@/components/ui/button';

interface DiceRendererProps {
  initialDiceType?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  height?: number;
  autoRotate?: boolean;
  hideControls?: boolean;
  onRollComplete?: (result: number) => void;
}

export const DiceRenderer: React.FC<DiceRendererProps> = ({
  initialDiceType = 'd20',
  height = 300,
  autoRotate = true,
  hideControls = false,
  onRollComplete
}) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>(initialDiceType);
  const [rolling, setRolling] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  const handleRoll = () => {
    if (rolling) return;
    
    setRolling(true);
    
    // Simulate roll animation time
    setTimeout(() => {
      setRolling(false);
      if (onRollComplete) {
        // Generate random result based on dice type
        const max = parseInt(diceType.substring(1));
        const result = Math.floor(Math.random() * max) + 1;
        onRollComplete(result);
      }
    }, 1500);
  };

  const renderDice = () => {
    const props = { rolling, themeColor: currentTheme.accent };
    
    switch (diceType) {
      case 'd4': return <DiceD4 {...props} />;
      case 'd6': return <DiceD6 {...props} />;
      case 'd8': return <DiceD8 {...props} />;
      case 'd10': return <DiceD10 {...props} />;
      case 'd12': return <DiceD12 {...props} />;
      case 'd20': return <DiceD20 {...props} />;
      default: return <DiceD20 {...props} />;
    }
  };

  return (
    <div className="relative" style={{ height }}>
      <Canvas>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {renderDice()}
        <OrbitControls 
          enablePan={!hideControls} 
          enableZoom={!hideControls}
          autoRotate={autoRotate && !rolling}
          autoRotateSpeed={3}
        />
      </Canvas>
      
      {!hideControls && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={diceType === type ? "default" : "outline"}
              onClick={() => setDiceType(type)}
              className="px-2 py-1"
            >
              {type}
            </Button>
          ))}
        </div>
      )}
      
      {!hideControls && (
        <Button 
          className="absolute top-2 right-2 bg-primary hover:bg-primary/90"
          size="sm"
          onClick={handleRoll}
          disabled={rolling}
        >
          {rolling ? 'Rolling...' : 'Roll!'}
        </Button>
      )}
    </div>
  );
};
