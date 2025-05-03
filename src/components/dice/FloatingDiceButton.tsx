
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DicePanel } from '@/components/character-sheet/DicePanel';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const FloatingDiceButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="lg" 
            className="rounded-full h-16 w-16 p-0 shadow-lg" 
            style={{ 
              backgroundColor: `${currentTheme.accent}`,
              color: currentTheme.textColor
            }}
          >
            <Dices className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-[95%] bg-black/90 border-white/20 p-0 pt-4">
          <SheetHeader className="px-6">
            <SheetTitle className="text-white text-2xl">Кубики</SheetTitle>
            <SheetDescription className="text-white/70 text-base">
              Используйте виртуальные кубики для бросков
            </SheetDescription>
          </SheetHeader>
          <div className="py-2 h-[calc(100vh-120px)] overflow-y-auto px-4">
            <DicePanel compactMode={true} fixedPosition={true} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FloatingDiceButton;
