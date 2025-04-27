
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

export const BackgroundTab = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Предыстория персонажа</h3>
      
      <div>
        <h4 className="font-medium mb-1">Предыстория персонажа</h4>
        <Textarea 
          placeholder="Опишите историю вашего персонажа..."
          className="min-h-[100px]"
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-1">Внешность</h4>
        <Textarea 
          placeholder="Опишите внешность вашего персонажа..."
          className="min-h-[100px]"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-1">Личностные черты</h4>
          <Textarea 
            placeholder="Какие качества отличают вашего персонажа?"
            className="min-h-[80px]"
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Идеалы</h4>
          <Textarea 
            placeholder="Во что верит ваш персонаж?"
            className="min-h-[80px]"
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Узы</h4>
          <Textarea 
            placeholder="С чем или кем связан ваш персонаж?"
            className="min-h-[80px]"
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Слабости</h4>
          <Textarea 
            placeholder="Какие недостатки есть у вашего персонажа?"
            className="min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
};
