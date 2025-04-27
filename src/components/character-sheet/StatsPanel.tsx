
import React from 'react';
import { Card } from "@/components/ui/card";

export const StatsPanel = () => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Character Stats</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">STR</div>
          <div className="text-sm text-right">10 (+0)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">DEX</div>
          <div className="text-sm text-right">14 (+2)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">CON</div>
          <div className="text-sm text-right">12 (+1)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">INT</div>
          <div className="text-sm text-right">16 (+3)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">WIS</div>
          <div className="text-sm text-right">8 (-1)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">CHA</div>
          <div className="text-sm text-right">18 (+4)</div>
        </div>
      </div>
    </Card>
  );
};
