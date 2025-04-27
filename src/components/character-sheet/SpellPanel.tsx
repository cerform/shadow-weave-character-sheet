
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SpellPanel = () => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
      <h3 className="text-lg font-semibold mb-4">Spells</h3>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium mb-2">Cantrips</h4>
            <div className="space-y-2">
              <div className="p-2 bg-primary/5 rounded-md">
                <h5 className="font-medium">Eldritch Blast</h5>
                <p className="text-sm text-muted-foreground">A beam of crackling energy streaks toward a creature within range.</p>
              </div>
              
              <div className="p-2 bg-primary/5 rounded-md">
                <h5 className="font-medium">Minor Illusion</h5>
                <p className="text-sm text-muted-foreground">You create a sound or an image of an object.</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2">Level 1</h4>
            <div className="space-y-2">
              <div className="p-2 bg-primary/5 rounded-md">
                <h5 className="font-medium">Shield</h5>
                <p className="text-sm text-muted-foreground">An invisible barrier of magical force appears and protects you.</p>
              </div>
              
              <div className="p-2 bg-primary/5 rounded-md">
                <h5 className="font-medium">Magic Missile</h5>
                <p className="text-sm text-muted-foreground">You create three glowing darts of magical force.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
