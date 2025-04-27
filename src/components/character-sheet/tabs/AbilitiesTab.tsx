
import React from 'react';

export const AbilitiesTab = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Характеристики персонажа</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Сила</div>
          <div className="text-3xl font-bold">14</div>
          <div className="text-md">+2</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Ловкость</div>
          <div className="text-3xl font-bold">16</div>
          <div className="text-md">+3</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Телосложение</div>
          <div className="text-3xl font-bold">12</div>
          <div className="text-md">+1</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Интеллект</div>
          <div className="text-3xl font-bold">10</div>
          <div className="text-md">+0</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Мудрость</div>
          <div className="text-3xl font-bold">8</div>
          <div className="text-md">-1</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Харизма</div>
          <div className="text-3xl font-bold">15</div>
          <div className="text-md">+2</div>
        </div>
      </div>
      
      <div className="bg-primary/5 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Спасброски</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span>Сила</span>
            <span>+2</span>
          </div>
          <div className="flex justify-between">
            <span>Ловкость</span>
            <span>+5</span>
          </div>
          <div className="flex justify-between">
            <span>Телосложение</span>
            <span>+1</span>
          </div>
          <div className="flex justify-between">
            <span>Интеллект</span>
            <span>+0</span>
          </div>
          <div className="flex justify-between">
            <span>Мудрость</span>
            <span>-1</span>
          </div>
          <div className="flex justify-between">
            <span>Харизма</span>
            <span>+4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
