
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Character } from '@/types/character';
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, Heart } from "lucide-react";

interface HPBarProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const HPBar: React.FC<HPBarProps> = ({ character, onUpdate }) => {
  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [healAmount, setHealAmount] = useState<number>(0);
  const [tempHPAmount, setTempHPAmount] = useState<number>(0);

  // Получаем текущие значения HP, с обратной совместимостью
  const getCurrentHP = (): number => {
    if (character.currentHp !== undefined) return character.currentHp;
    if (character.hp !== undefined) return character.hp;
    if (character.hitPoints?.current !== undefined) return character.hitPoints.current;
    return 0;
  };

  const getMaxHP = (): number => {
    if (character.maxHp !== undefined) return character.maxHp;
    if (character.hitPoints?.maximum !== undefined) return character.hitPoints.maximum;
    return 0;
  };

  const getTempHP = (): number => {
    if (character.temporaryHp !== undefined) return character.temporaryHp;
    if (character.hitPoints?.temporary !== undefined) return character.hitPoints.temporary;
    return 0;
  };

  const currentHP = getCurrentHP();
  const maxHP = getMaxHP();
  const tempHP = getTempHP();
  const totalHP = maxHP > 0 ? maxHP : 1; // предотвращаем деление на ноль

  const healthPercentage = Math.max(0, Math.min(100, (currentHP / totalHP) * 100));
  
  // Генерируем цвет индикатора в зависимости от уровня здоровья
  const getHealthColor = (): string => {
    if (healthPercentage <= 25) return "bg-red-600";
    if (healthPercentage <= 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const handleDamage = () => {
    if (damageAmount <= 0) return;
    
    let updatedTempHP = tempHP;
    let updatedCurrentHP = currentHP;
    const damage = Math.max(0, damageAmount);
    
    // Сначала урон вычитается из временных хитов
    if (updatedTempHP > 0) {
      if (updatedTempHP >= damage) {
        updatedTempHP -= damage;
      } else {
        // Если временных хитов недостаточно, оставшийся урон вычитается из обычных хитов
        const remainingDamage = damage - updatedTempHP;
        updatedTempHP = 0;
        updatedCurrentHP = Math.max(0, updatedCurrentHP - remainingDamage);
      }
    } else {
      // Если нет временных хитов, урон наносится напрямую
      updatedCurrentHP = Math.max(0, updatedCurrentHP - damage);
    }
    
    // Обновляем персонажа
    onUpdate({ 
      hp: updatedCurrentHP,
      temporaryHp: updatedTempHP
    });
    
    setDamageAmount(0);
  };

  const handleHeal = () => {
    if (healAmount <= 0) return;
    
    // Лечение не может превысить максимальное здоровье
    const updatedCurrentHP = Math.min(maxHP, currentHP + Math.max(0, healAmount));
    
    // Обновляем персонажа
    onUpdate({ 
      hp: updatedCurrentHP 
    });
    
    setHealAmount(0);
  };

  const handleTempHP = () => {
    if (tempHPAmount <= 0) return;
    
    // Временные хиты не суммируются, а заменяются большим значением
    const updatedTempHP = Math.max(tempHP, tempHPAmount);
    
    // Обновляем персонажа
    onUpdate({ 
      temporaryHp: updatedTempHP 
    });
    
    setTempHPAmount(0);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          HP: {currentHP} / {maxHP} {tempHP > 0 && `+ ${tempHP} temp`}
        </div>
        <div className="text-xs text-muted-foreground">
          {healthPercentage.toFixed(0)}%
        </div>
      </div>
      <Progress value={healthPercentage} className={getHealthColor()} />
      
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="space-y-1">
          <div className="flex items-center">
            <Input 
              type="number"
              value={damageAmount}
              onChange={(e) => setDamageAmount(Number(e.target.value))}
              className="h-8"
              min="0"
            />
            <Button 
              className="h-8 ml-1 bg-red-600 hover:bg-red-700" 
              onClick={handleDamage}
              size="sm"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          <label className="text-xs text-muted-foreground">Урон</label>
        </div>

        <div className="space-y-1">
          <div className="flex items-center">
            <Input 
              type="number"
              value={healAmount}
              onChange={(e) => setHealAmount(Number(e.target.value))}
              className="h-8"
              min="0"
            />
            <Button 
              className="h-8 ml-1 bg-green-600 hover:bg-green-700" 
              onClick={handleHeal}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <label className="text-xs text-muted-foreground">Лечение</label>
        </div>

        <div className="space-y-1">
          <div className="flex items-center">
            <Input 
              type="number"
              value={tempHPAmount}
              onChange={(e) => setTempHPAmount(Number(e.target.value))}
              className="h-8"
              min="0"
            />
            <Button 
              className="h-8 ml-1 bg-blue-600 hover:bg-blue-700" 
              onClick={handleTempHP}
              size="sm"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <label className="text-xs text-muted-foreground">Временные HP</label>
        </div>
      </div>
    </div>
  );
};

export default HPBar;
