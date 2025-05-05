
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Shield, ThumbsUp, Hash, ZapOff } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character';

interface ResourcePanelProps {
  character?: Character | null;
  onUpdate?: (updates: Partial<Character>) => void;
  isDM?: boolean;
}

const ResourcePanel = ({ character, onUpdate, isDM = false }: ResourcePanelProps) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const handleChangeHP = (amount: number) => {
    if (!character || !onUpdate) return;
    
    const newHp = Math.min(Math.max(0, (character.currentHp || 0) + amount), character.maxHp || 0);
    onUpdate({ currentHp: newHp });
  };
  
  const handleSetTempHP = (amount: number) => {
    if (!character || !onUpdate) return;
    
    onUpdate({ temporaryHp: amount });
  };
  
  const handleShortRest = () => {
    if (!character || !onUpdate) return;
    
    const hitDice = character.hitDice || { total: character.level || 1, used: 0, value: 'd8' };
    const remainingHitDice = hitDice.total - hitDice.used;
    
    if (remainingHitDice > 0) {
      // Для простоты просто восстанавливаем часть HP
      const recoveredHP = Math.floor(character.level / 2) + 1;
      const newCurrentHp = Math.min((character.currentHp || 0) + recoveredHP, character.maxHp || 0);
      
      onUpdate({
        currentHp: newCurrentHp,
        hitDice: {
          ...hitDice,
          used: hitDice.used + 1
        }
      });
    }
  };
  
  const handleLongRest = () => {
    if (!character || !onUpdate) return;
    
    const hitDice = character.hitDice || { total: character.level || 1, used: 0, value: 'd8' };
    const regainedHitDice = Math.max(1, Math.floor(hitDice.total / 2));
    const newUsedHitDice = Math.max(0, hitDice.used - regainedHitDice);
    
    // Восстанавливаем все HP и часть кубиков хитов
    onUpdate({
      currentHp: character.maxHp || 0,
      temporaryHp: 0,
      hitDice: {
        ...hitDice,
        used: newUsedHitDice
      }
    });
  };
  
  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-primary/20 theme-${theme}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          Здоровье и Ресурсы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* HP Bar */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Хиты</span>
              <span>{character?.currentHp || 0}/{character?.maxHp || 0}</span>
            </div>
            <div className="relative">
              <Progress 
                value={(character?.currentHp || 0) / (character?.maxHp || 1) * 100} 
                className="h-3" 
                indicatorClassName="bg-gradient-to-r from-red-500 to-red-600" 
              />
            </div>
            <div className="flex justify-between gap-1 mt-2">
              <Button variant="destructive" size="sm" onClick={() => handleChangeHP(-1)}>-1</Button>
              <Button variant="destructive" size="sm" onClick={() => handleChangeHP(-5)}>-5</Button>
              <Button variant="outline" size="sm" onClick={() => handleChangeHP(1)}>+1</Button>
              <Button variant="outline" size="sm" onClick={() => handleChangeHP(5)}>+5</Button>
            </div>
          </div>
          
          {/* Temporary HP */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-blue-400" />
                Временные хиты
              </span>
              <span>{character?.temporaryHp || 0}</span>
            </div>
            <div className="flex justify-between gap-1">
              <Button variant="secondary" size="sm" onClick={() => handleSetTempHP(0)}>
                <ZapOff className="h-3 w-3 mr-1" />
                Сбросить
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleSetTempHP((character?.temporaryHp || 0) + 1)}>+1</Button>
              <Button variant="secondary" size="sm" onClick={() => handleSetTempHP((character?.temporaryHp || 0) - 1)}>-1</Button>
            </div>
          </div>
          
          {/* Hit Dice */}
          {character?.hitDice && (
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="flex items-center">
                  <Hash className="h-4 w-4 mr-1 text-amber-400" />
                  Кости хитов ({character.hitDice.value})
                </span>
                <span>{character.hitDice.total - character.hitDice.used}/{character.hitDice.total}</span>
              </div>
            </div>
          )}
          
          {/* Inspiration */}
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1 text-purple-400" />
              Вдохновение
            </span>
            <Button 
              variant={character?.inspiration ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate?.({ inspiration: !character?.inspiration })}
            >
              {character?.inspiration ? "Активно" : "Нет"}
            </Button>
          </div>
          
          {/* Rest Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              variant="outline"
              onClick={handleShortRest}
              className="h-auto"
            >
              Короткий отдых
            </Button>
            <Button 
              variant="default"
              onClick={handleLongRest}
              className="h-auto"
              style={{ backgroundColor: currentTheme.accent }}
            >
              Длинный отдых
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
