
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface HPBarProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  compactMode?: boolean;
}

export const HPBar: React.FC<HPBarProps> = ({
  character, 
  onUpdate, 
  compactMode = false
}) => {
  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [healAmount, setHealAmount] = useState<number>(0);
  const [tempHPAmount, setTempHPAmount] = useState<number>(0);
  
  // Получение текущего HP с учетом разных форматов данных
  const getCurrentHP = (): number => {
    return character.currentHp !== undefined 
      ? character.currentHp 
      : (character.hitPoints?.current || 0);
  };
  
  // Получение максимального HP с учетом разных форматов данных
  const getMaxHP = (): number => {
    return character.maxHp || character.hitPoints?.maximum || 0;
  };
  
  // Получение временного HP с учетом разных форматов данных
  const getTempHP = (): number => {
    return character.temporaryHp || character.tempHp || character.hitPoints?.temporary || 0;
  };
  
  // Обработчик урона
  const handleDamage = () => {
    const currentHP = getCurrentHP();
    const tempHP = getTempHP();
    
    let newCurrentHP = currentHP;
    let newTempHP = tempHP;
    
    // Сначала урон идет во временные очки здоровья
    if (tempHP > 0) {
      if (damageAmount <= tempHP) {
        newTempHP = tempHP - damageAmount;
      } else {
        const remainingDamage = damageAmount - tempHP;
        newTempHP = 0;
        newCurrentHP = Math.max(0, currentHP - remainingDamage);
      }
    } else {
      newCurrentHP = Math.max(0, currentHP - damageAmount);
    }
    
    onUpdate({ 
      currentHp: newCurrentHP,
      temporaryHp: newTempHP,
      hitPoints: {
        current: newCurrentHP,
        maximum: getMaxHP(),
        temporary: newTempHP
      }
    });
    
    setDamageAmount(0);
  };
  
  // Обработчик лечения
  const handleHeal = () => {
    const currentHP = getCurrentHP();
    const maxHP = getMaxHP();
    
    const newCurrentHP = Math.min(maxHP, currentHP + healAmount);
    
    onUpdate({ 
      currentHp: newCurrentHP,
      hitPoints: {
        current: newCurrentHP,
        maximum: maxHP,
        temporary: getTempHP()
      }
    });
    
    setHealAmount(0);
  };
  
  // Обработчик добавления временных очков здоровья
  const handleAddTempHP = () => {
    const newTempHP = Math.max(getTempHP(), tempHPAmount);
    
    onUpdate({ 
      temporaryHp: newTempHP,
      hitPoints: {
        current: getCurrentHP(),
        maximum: getMaxHP(),
        temporary: newTempHP
      }
    });
    
    setTempHPAmount(0);
  };
  
  // Расчет процента для полосы здоровья
  const calculateHPPercentage = (): number => {
    const currentHP = getCurrentHP();
    const maxHP = getMaxHP();
    return maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  };
  
  // Определение цвета полосы здоровья
  const getHealthColor = (): string => {
    const percentage = calculateHPPercentage();
    if (percentage > 60) return 'bg-green-600';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-600';
  };
  
  return (
    <div className="bg-card rounded-md p-4 space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium">Здоровье</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">{getCurrentHP()}/{getMaxHP()}</span>
            {getTempHP() > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-1 rounded">
                +{getTempHP()} вр.
              </span>
            )}
          </div>
        </div>
        
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHealthColor()} transition-all duration-500`}
            style={{ width: `${calculateHPPercentage()}%` }}
          />
        </div>
      </div>
      
      {!compactMode && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="damage" className="text-xs">Урон</Label>
              <div className="flex mt-1">
                <Input
                  id="damage"
                  type="number"
                  min="0"
                  value={damageAmount || ''}
                  onChange={(e) => setDamageAmount(parseInt(e.target.value) || 0)}
                  className="rounded-r-none"
                />
                <Button 
                  onClick={handleDamage} 
                  variant="destructive" 
                  className="rounded-l-none"
                  disabled={damageAmount <= 0}
                >
                  ✓
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="heal" className="text-xs">Лечение</Label>
              <div className="flex mt-1">
                <Input
                  id="heal"
                  type="number"
                  min="0"
                  value={healAmount || ''}
                  onChange={(e) => setHealAmount(parseInt(e.target.value) || 0)}
                  className="rounded-r-none"
                />
                <Button 
                  onClick={handleHeal} 
                  variant="default" 
                  className="rounded-l-none bg-green-600 hover:bg-green-700"
                  disabled={healAmount <= 0}
                >
                  ✓
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tempHP" className="text-xs">Врем. ОЗ</Label>
              <div className="flex mt-1">
                <Input
                  id="tempHP"
                  type="number"
                  min="0"
                  value={tempHPAmount || ''}
                  onChange={(e) => setTempHPAmount(parseInt(e.target.value) || 0)}
                  className="rounded-r-none"
                />
                <Button 
                  onClick={handleAddTempHP} 
                  variant="secondary" 
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={tempHPAmount <= 0}
                >
                  ✓
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onUpdate({ 
                currentHp: getMaxHP(),
                hitPoints: {
                  current: getMaxHP(),
                  maximum: getMaxHP(),
                  temporary: getTempHP()
                }
              })}
            >
              Полное лечение
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HPBar;
