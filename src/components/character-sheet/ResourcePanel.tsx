
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Plus, Minus, Heart, Shield, Skull, RefreshCw } from "lucide-react";
import { Character } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Обновляем интерфейс ResourcePanelProps, добавляя недостающие свойства
export interface ResourcePanelProps {
  character?: Character | null;
  onUpdate?: (character: Partial<Character>) => void;
  isDM?: boolean;
  // Добавляем свойства, которые используются в CharacterSheet
  currentHp?: number;
  maxHp?: number;
  onHpChange?: (newHp: number) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ 
  character, 
  onUpdate, 
  isDM = false,
  currentHp, 
  maxHp, 
  onHpChange 
}) => {
  // Используем либо переданные значения, либо значения из character
  const hp = currentHp ?? character?.currentHp ?? 0;
  const maxHitPoints = maxHp ?? character?.maxHp ?? 0;
  const [tempHp, setTempHp] = useState(character?.temporaryHp || 0);
  const [damageAmount, setDamageAmount] = useState(1);
  const [healAmount, setHealAmount] = useState(1);
  const [tempAmount, setTempAmount] = useState(1);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const handleHpChange = (amount: number) => {
    const newHp = Math.max(0, Math.min(hp + amount, maxHitPoints));
    
    // Используем переданный onHpChange callback, если он есть
    if (onHpChange) {
      onHpChange(newHp);
    } 
    // В противном случае используем onUpdate
    else if (onUpdate && character) {
      onUpdate({
        currentHp: newHp
      });
    }
  };
  
  const handleTempHpChange = (amount: number) => {
    const newTempHp = Math.max(0, tempHp + amount);
    setTempHp(newTempHp);
    
    if (onUpdate && character) {
      onUpdate({
        temporaryHp: newTempHp
      });
    }
  };

  const handleDamage = () => {
    // Сначала применяем урон к временным хитам
    let remainingDamage = damageAmount;
    if (tempHp > 0) {
      if (tempHp >= remainingDamage) {
        handleTempHpChange(-remainingDamage);
        remainingDamage = 0;
      } else {
        remainingDamage -= tempHp;
        handleTempHpChange(-tempHp);
      }
    }
    
    // Оставшийся урон применяем к обычным хитам
    if (remainingDamage > 0) {
      handleHpChange(-remainingDamage);
    }
  };

  const handleHeal = () => {
    handleHpChange(healAmount);
  };

  const handleAddTempHp = () => {
    // Для временных хитов берем максимальное значение
    const newTempHp = Math.max(tempHp, tempAmount);
    setTempHp(newTempHp);
    
    if (onUpdate && character) {
      onUpdate({
        temporaryHp: newTempHp
      });
    }
  };

  const getHpPercentage = () => {
    if (!maxHitPoints) return 0;
    return (hp / maxHitPoints) * 100;
  };

  const getHpColor = () => {
    const percent = getHpPercentage();
    if (percent > 50) return "bg-green-500";
    if (percent > 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            Здоровье
          </div>
          {tempHp > 0 && (
            <div className="flex items-center text-sm font-normal text-cyan-400">
              <Shield className="mr-1 h-4 w-4" />
              +{tempHp} временных
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">HP</span>
            <span className="text-sm font-medium">
              {hp}/{maxHitPoints}
            </span>
          </div>
          <Progress 
            value={getHpPercentage()} 
            className="h-2"
            indicatorClassName={getHpColor()}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Урон</span>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-5 w-5 rounded-r-none"
                  onClick={() => setDamageAmount(Math.max(1, damageAmount - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="h-5 px-2 flex items-center justify-center border-y">
                  {damageAmount}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-5 w-5 rounded-l-none"
                  onClick={() => setDamageAmount(damageAmount + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center gap-1"
              onClick={handleDamage}
              size="sm"
            >
              <Skull className="h-4 w-4" />
              <span>Урон</span>
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Лечение</span>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-5 w-5 rounded-r-none"
                  onClick={() => setHealAmount(Math.max(1, healAmount - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="h-5 px-2 flex items-center justify-center border-y">
                  {healAmount}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-5 w-5 rounded-l-none"
                  onClick={() => setHealAmount(healAmount + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button 
              variant="default"
              className="w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700"
              onClick={handleHeal}
              size="sm"
            >
              <Heart className="h-4 w-4" />
              <span>Лечить</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Временные хиты</span>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-5 w-5 rounded-r-none"
                onClick={() => setTempAmount(Math.max(1, tempAmount - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="h-5 px-2 flex items-center justify-center border-y">
                {tempAmount}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-5 w-5 rounded-l-none"
                onClick={() => setTempAmount(tempAmount + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button 
            variant="default"
            className="w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-700"
            onClick={handleAddTempHp}
            size="sm"
          >
            <Shield className="h-4 w-4" />
            <span>Добавить врем. хиты</span>
          </Button>
        </div>
        
        {/* Полный отдых (восстановление всех хитов) */}
        <Button 
          variant="outline" 
          className="w-full mt-4 flex items-center justify-center gap-1"
          onClick={() => {
            if (onHpChange) {
              onHpChange(maxHitPoints);
            } else if (onUpdate && character) {
              onUpdate({ currentHp: maxHitPoints });
            }
            handleTempHpChange(-tempHp); // Сбрасываем временные хиты
          }}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Полный отдых</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
