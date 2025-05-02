
import React from 'react';
import { Card } from "@/components/ui/card";
import { DicePanel } from '@/components/character-sheet/DicePanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/contexts/SocketContext';

const LeftPanelDiceRoller = () => {
  const { sessionData } = useSocket();
  
  return (
    <ScrollArea className="h-full pr-2">
      <div className="p-3">
        <Card className="bg-background/40 backdrop-blur-md border-primary/20 shadow-xl">
          <div className="p-3">
            <h3 className="font-bold mb-3 text-lg text-center">Бросок кубиков</h3>
            <DicePanel useDmMode={true} />
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default LeftPanelDiceRoller;
