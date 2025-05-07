
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { Heart, Shield, Plus, Minus } from 'lucide-react';

export interface HPBarProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const HPBar: React.FC<HPBarProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [healAmount, setHealAmount] = useState<number>(0);
  const [tempHPAmount, setTempHPAmount] = useState<number>(0);

  const handleDamage = () => {
    if (!damageAmount) return;
    
    let tempHP = character.temporaryHp || 0;
    let currentHP = character.currentHp;
    const damageValue = Math.max(0, damageAmount);
    
    // First apply damage to temp HP
    if (tempHP > 0) {
      if (tempHP >= damageValue) {
        tempHP -= damageValue;
        onUpdate({ temporaryHp: tempHP });
        toast({
          title: "Урон поглощен",
          description: `${damageValue} урона поглощено временными хитами.`
        });
        setDamageAmount(0);
        return;
      } else {
        // Some damage goes to temp HP, rest to regular HP
        const remainingDamage = damageValue - tempHP;
        tempHP = 0;
        currentHP = Math.max(0, currentHP - remainingDamage);
        onUpdate({ temporaryHp: tempHP, currentHp: currentHP });
        toast({
          title: "Урон получен",
          description: `${tempHP} урона поглощено временными хитами, ${remainingDamage} урона нанесено персонажу.`
        });
        setDamageAmount(0);
        return;
      }
    }
    
    // All damage goes to regular HP
    currentHP = Math.max(0, currentHP - damageValue);
    onUpdate({ currentHp: currentHP });
    
    if (currentHP === 0) {
      toast({
        title: "Персонаж без сознания!",
        description: "Хиты упали до 0, персонаж теряет сознание и должен делать спасброски от смерти.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Урон получен",
        description: `${damageValue} урона нанесено персонажу.`
      });
    }
    
    setDamageAmount(0);
  };

  const handleHeal = () => {
    if (!healAmount) return;
    
    const healValue = Math.max(0, healAmount);
    const newHP = Math.min(character.maxHp, character.currentHp + healValue);
    
    onUpdate({ currentHp: newHP });
    
    toast({
      title: "Лечение получено",
      description: `Восстановлено ${healValue} хитов.`
    });
    
    setHealAmount(0);
  };

  const handleAddTempHP = () => {
    if (!tempHPAmount) return;
    
    const tempValue = Math.max(0, tempHPAmount);
    // Temporary HP doesn't stack, use the higher value
    const newTempHP = Math.max(character.temporaryHp || 0, tempValue);
    
    onUpdate({ temporaryHp: newTempHP });
    
    toast({
      title: "Временные хиты получены",
      description: `Получено ${tempValue} временных хитов.`
    });
    
    setTempHPAmount(0);
  };

  const hpPercentage = Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100));
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-1 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-500" />
          Хиты
        </h3>
        
        <div className="w-full h-6 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${hpPercentage}%`,
              backgroundColor: hpPercentage > 50 ? 'rgb(34, 197, 94)' : 
                              hpPercentage > 25 ? 'rgb(234, 179, 8)' : 
                              'rgb(239, 68, 68)'
            }}
          ></div>
        </div>
        
        <div className="flex justify-between mb-2 text-sm">
          <div>Текущие: {character.currentHp}</div>
          <div className="font-medium">/ {character.maxHp}</div>
          {character.temporaryHp > 0 && (
            <div className="text-primary ml-2">(+{character.temporaryHp} временных)</div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="flex items-center mb-1">
            <Minus className="w-4 h-4 mr-1 text-red-500" />
            <span className="text-xs">Урон</span>
          </div>
          <div className="flex">
            <Input 
              type="number" 
              min="0"
              value={damageAmount || ''}
              onChange={(e) => setDamageAmount(parseInt(e.target.value) || 0)}
              className="h-8"
            />
            <Button variant="destructive" size="sm" onClick={handleDamage} className="ml-1 h-8 px-2">
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Plus className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-xs">Лечение</span>
          </div>
          <div className="flex">
            <Input 
              type="number" 
              min="0"
              value={healAmount || ''}
              onChange={(e) => setHealAmount(parseInt(e.target.value) || 0)}
              className="h-8"
            />
            <Button variant="default" size="sm" onClick={handleHeal} className="ml-1 h-8 px-2 bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Shield className="w-4 h-4 mr-1 text-blue-500" />
            <span className="text-xs">Врем. хиты</span>
          </div>
          <div className="flex">
            <Input 
              type="number" 
              min="0"
              value={tempHPAmount || ''}
              onChange={(e) => setTempHPAmount(parseInt(e.target.value) || 0)}
              className="h-8"
            />
            <Button variant="secondary" size="sm" onClick={handleAddTempHP} className="ml-1 h-8 px-2">
              <Shield className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
