
import React, { useState } from "react";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { PlayerDicePanel } from "@/components/character-sheet/PlayerDicePanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

const CharacterSheetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <div className="relative">
      <CharacterSheet />
      
      <div className="fixed bottom-24 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full h-18 w-18 p-0 shadow-lg" 
              style={{ 
                width: '70px', 
                height: '70px',
                backgroundColor: `rgba(${currentTheme.accent}, 0.9)`,
                color: currentTheme.textColor
              }}
            >
              <Dices className="h-10 w-10" />
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
              <PlayerDicePanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default CharacterSheetPage;
