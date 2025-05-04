
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { PlayerDicePanel } from '@/components/character-sheet/PlayerDicePanel';
import { useUserTheme } from '@/hooks/use-user-theme';

export const FloatingDiceButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  
  // Используем активную тему с запасным вариантом
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button 
          size="lg" 
          className="rounded-full h-16 w-16 p-0 shadow-lg border-2" 
          style={{ 
            backgroundColor: `${currentTheme.accent}`,
            color: '#FFFFFF',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
          }}
          onClick={handleButtonClick}
        >
          <Dices className="h-8 w-8" />
        </Button>
        <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-[95%] bg-black/95 border-white/30 p-0 pt-4">
          <SheetHeader className="px-6">
            <SheetTitle className="text-white text-2xl">Кубики</SheetTitle>
            <SheetDescription className="text-white/90 text-base">
              Используйте виртуальные кубики для бросков
            </SheetDescription>
          </SheetHeader>
          <div className="py-2 h-[calc(100vh-120px)] overflow-y-auto px-4">
            <PlayerDicePanel />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FloatingDiceButton;
