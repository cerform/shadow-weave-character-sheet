
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ResourcePanelProps {
  currentHp: number;
  maxHp: number;
  onHpChange: (value: number) => void;
}

export const ResourcePanel = ({ currentHp, maxHp, onHpChange }: ResourcePanelProps) => {
  const handleHpAdjust = (amount: number) => {
    const newHp = Math.max(0, Math.min(currentHp + amount, maxHp));
    onHpChange(newHp);
  };
  
  const hpPercentage = (currentHp / maxHp) * 100;
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Resources</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Hit Points</span>
            <span className="text-sm">
              {currentHp} / {maxHp}
            </span>
          </div>
          <Progress value={hpPercentage} className="h-3" />
          <div className="flex justify-between gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(-1)}>-1</Button>
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(-5)}>-5</Button>
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(1)}>+1</Button>
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(5)}>+5</Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">Armor Class</div>
            <div className="text-sm text-right">14</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm font-medium">Speed</div>
            <div className="text-sm text-right">30 ft.</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm font-medium">Initiative</div>
            <div className="text-sm text-right">+2</div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-sm font-medium mb-2">Hit Dice</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">3d8</span>
            <div>
              <Button size="sm" variant="outline">Roll</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
