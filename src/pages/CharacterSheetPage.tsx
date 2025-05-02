
import React, { useState } from "react";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { DicePanel } from "@/components/character-sheet/DicePanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";

const CharacterSheetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <CharacterSheet />
      
      <div className="fixed bottom-24 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full h-16 w-16 p-0 bg-primary hover:bg-primary/90 shadow-lg">
              <Dices className="h-8 w-8" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-[95%] bg-black/90 border-white/20">
            <SheetHeader>
              <SheetTitle className="text-white text-2xl">Кубики</SheetTitle>
              <SheetDescription className="text-white/70 text-base">
                Используйте виртуальные кубики для бросков
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 h-[calc(100vh-120px)] overflow-y-auto">
              <DicePanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default CharacterSheetPage;
