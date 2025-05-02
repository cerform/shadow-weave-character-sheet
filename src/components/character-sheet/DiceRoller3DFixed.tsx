
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DiceRoller3D } from './DiceRoller3D';

interface DiceRoller3DFixedProps {
  onClose: () => void;
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  onRollComplete?: (result: number) => void;
  themeColor?: string;
  modifier?: number;
  diceCount?: number;
}

export const DiceRoller3DFixed: React.FC<DiceRoller3DFixedProps> = ({
  onClose,
  initialDice = 'd20',
  onRollComplete,
  themeColor,
  modifier = 0,
  diceCount = 1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation to fade in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handler for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/70 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-xl h-[500px] bg-black/40 rounded-xl overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost" 
          className="absolute top-2 right-2 z-10 rounded-full p-2 h-auto"
          onClick={handleClose}
        >
          <X size={20} />
        </Button>
        
        <DiceRoller3D 
          initialDice={initialDice}
          hideControls={false}
          onRollComplete={onRollComplete}
          themeColor={themeColor}
          modifier={modifier}
          diceCount={diceCount}
        />
      </div>
    </div>
  );
};

// Add a default export to maintain compatibility with code that might be using it
export default DiceRoller3DFixed;
