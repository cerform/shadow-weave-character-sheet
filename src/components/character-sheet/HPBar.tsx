
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

export interface HPBarProps {
  currentHp: number;
  maxHp: number;
  temporaryHp?: number;
  onUpdate: (updates: any) => void;
}

export const HPBar: React.FC<HPBarProps> = ({ 
  currentHp, 
  maxHp, 
  temporaryHp = 0,
  onUpdate 
}) => {
  const [damageAmount, setDamageAmount] = useState<string>('');
  const [healAmount, setHealAmount] = useState<string>('');
  const [tempHpAmount, setTempHpAmount] = useState<string>('');
  
  // Calculate health percentage for the progress bar
  const calculateHealthPercentage = () => {
    if (maxHp <= 0) return 0;
    let percentage = (currentHp / maxHp) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    return percentage;
  };
  
  // Handle taking damage
  const handleTakeDamage = () => {
    if (!damageAmount || isNaN(Number(damageAmount))) return;
    
    const damage = parseInt(damageAmount);
    if (damage <= 0) return;
    
    let newTempHp = temporaryHp;
    let newCurrentHp = currentHp;
    
    // Damage reduces temporary HP first
    if (newTempHp > 0) {
      if (damage <= newTempHp) {
        newTempHp -= damage;
      } else {
        // If damage is greater than temp HP, the rest goes to current HP
        const remainingDamage = damage - newTempHp;
        newTempHp = 0;
        newCurrentHp = Math.max(0, newCurrentHp - remainingDamage);
      }
    } else {
      // No temp HP, directly reduce current HP
      newCurrentHp = Math.max(0, newCurrentHp - damage);
    }
    
    onUpdate({ 
      currentHp: newCurrentHp, 
      temporaryHp: newTempHp 
    });
    
    setDamageAmount('');
  };
  
  // Handle healing
  const handleHeal = () => {
    if (!healAmount || isNaN(Number(healAmount))) return;
    
    const heal = parseInt(healAmount);
    if (heal <= 0) return;
    
    // Can't heal beyond max HP
    const newHp = Math.min(maxHp, currentHp + heal);
    
    onUpdate({ currentHp: newHp });
    setHealAmount('');
  };
  
  // Handle adding temporary HP
  const handleAddTempHp = () => {
    if (!tempHpAmount || isNaN(Number(tempHpAmount))) return;
    
    const tempHp = parseInt(tempHpAmount);
    if (tempHp <= 0) return;
    
    // Temporary HP doesn't stack, it replaces if higher
    const newTempHp = Math.max(temporaryHp, tempHp);
    
    onUpdate({ temporaryHp: newTempHp });
    setTempHpAmount('');
  };
  
  const healthPercentage = calculateHealthPercentage();
  const healthBarColor = healthPercentage > 50 ? 'bg-green-500' : 
                         healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Здоровье</h3>
          <div className="text-right">
            <span className="text-xl font-bold">
              {currentHp} / {maxHp}
            </span>
            {temporaryHp > 0 && (
              <span className="text-sm text-blue-500 ml-2">
                +{temporaryHp} врем.
              </span>
            )}
          </div>
        </div>
        
        {/* Health bar */}
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div 
            className={`h-full ${healthBarColor} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        
        {/* HP Controls */}
        <div className="grid grid-cols-3 gap-2">
          {/* Damage */}
          <div className="flex items-center">
            <Input 
              type="number"
              min="0"
              placeholder="Урон"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              className="mr-1"
            />
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleTakeDamage}
              className="flex-shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Heal */}
          <div className="flex items-center">
            <Input 
              type="number"
              min="0"
              placeholder="Лечение"
              value={healAmount}
              onChange={(e) => setHealAmount(e.target.value)}
              className="mr-1"
            />
            <Button 
              size="sm" 
              variant="default" 
              onClick={handleHeal}
              className="flex-shrink-0 bg-green-500 hover:bg-green-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Temp HP */}
          <div className="flex items-center">
            <Input 
              type="number"
              min="0"
              placeholder="Врем. ХП"
              value={tempHpAmount}
              onChange={(e) => setTempHpAmount(e.target.value)}
              className="mr-1"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAddTempHp}
              className="flex-shrink-0 text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
