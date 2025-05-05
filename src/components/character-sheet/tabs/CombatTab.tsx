import React from 'react';
import { Character } from '@/contexts/CharacterContext';

interface CombatTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const CombatTab: React.FC<CombatTabProps> = ({ character, onUpdate }) => {
  return (
    <div>
      <h2>Боевые характеристики</h2>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Боевые навыки</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Короткий меч</div>
              <Button variant="outline" size="sm">Атака</Button>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Бонус атаки:</span> +5
              </div>
              <div>
                <span className="text-muted-foreground">Урон:</span> 1d6+3 колющий
              </div>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Свойства:</span> Легкое, фехтовальное
            </div>
          </div>
          
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Кинжал</div>
              <Button variant="outline" size="sm">Атака</Button>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Бонус атаки:</span> +5
              </div>
              <div>
                <span className="text-muted-foreground">Урон:</span> 1d4+3 колющий
              </div>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Свойства:</span> Легкое, метательное (20/60)
            </div>
          </div>
          
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Короткий лук</div>
              <Button variant="outline" size="sm">Атака</Button>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Бонус атаки:</span> +5
              </div>
              <div>
                <span className="text-muted-foreground">Урон:</span> 1d6+3 колющий
              </div>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Свойства:</span> Боеприпас (80/320), двуручное
            </div>
          </div>
        </div>
        
        <Button className="w-full">+ Добавить оружие</Button>
      </div>
    </div>
  );
};
