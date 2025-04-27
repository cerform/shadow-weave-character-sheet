
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SpellsTab = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Заклинания</h3>
      
      <div className="bg-primary/5 rounded-lg p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
        <div>
          <div className="text-xs text-muted-foreground">1 круг</div>
          <div className="font-bold">3/4</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">2 круг</div>
          <div className="font-bold">2/3</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">3 круг</div>
          <div className="font-bold">1/2</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">4 круг</div>
          <div className="font-bold">0/0</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">5 круг</div>
          <div className="font-bold">0/0</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">6 круг</div>
          <div className="font-bold">0/0</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Заговоры</h4>
          <div className="space-y-2">
            <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
              <h5 className="font-medium">Луч холода</h5>
              <p className="text-sm text-muted-foreground">Дистанция: 60 футов, Длительность: Мгновенная</p>
            </div>
            
            <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
              <h5 className="font-medium">Танцующие огоньки</h5>
              <p className="text-sm text-muted-foreground">Дистанция: 120 футов, Длительность: Концентрация, до 1 минуты</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">1 круг</h4>
          <div className="space-y-2">
            <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
              <h5 className="font-medium">Волшебная стрела</h5>
              <p className="text-sm text-muted-foreground">Дистанция: 120 футов, Длительность: Мгновенная</p>
            </div>
            
            <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
              <h5 className="font-medium">Щит</h5>
              <p className="text-sm text-muted-foreground">Дистанция: На себя, Длительность: 1 раунд</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">2 круг</h4>
          <div className="space-y-2">
            <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
              <h5 className="font-medium">Невидимость</h5>
              <p className="text-sm text-muted-foreground">Дистанция: Касание, Длительность: Концентрация, до 1 часа</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
