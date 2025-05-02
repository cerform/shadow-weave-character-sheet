
import React, { useState } from "react";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { DicePanel } from "@/components/character-sheet/DicePanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dice } from "lucide-react";

const CharacterSheetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <CharacterSheet />
      
      <div className="fixed bottom-4 right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full h-14 w-14 p-0 bg-primary hover:bg-primary/90 shadow-lg">
              <Dice className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Кубики</SheetTitle>
              <SheetDescription>
                Используйте виртуальные кубики для бросков
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 h-[calc(100vh-120px)]">
              <DicePanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default CharacterSheetPage;
