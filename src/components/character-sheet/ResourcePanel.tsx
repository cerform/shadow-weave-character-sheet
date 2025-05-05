
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Character } from '@/types/character';

export interface ResourcePanelProps {
  character: Character | null;
  onUpdate: (updates: Partial<Character>) => void;
  onHpChange?: (newHp: number) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, onUpdate, onHpChange }) => {
  const [damage, setDamage] = useState<number>(0);
  const [healing, setHealing] = useState<number>(0);
  const [tempHP, setTempHP] = useState<number>(0);
  
  // Рассчитываем текущие значения
  const maxHp = character?.maxHp || 0;
  const currentHp = character?.currentHp || 0;
  const temporaryHp = character?.temporaryHp || 0;
  
  const handleDamage = () => {
    if (!character || damage <= 0) return;
    
    // Сначала урон поглощается временными хитами
    let remainingDamage = damage;
    let newTempHp = temporaryHp;
    
    if (temporaryHp > 0) {
      if (temporaryHp >= remainingDamage) {
        newTempHp = temporaryHp - remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= temporaryHp;
        newTempHp = 0;
      }
    }
    
    // Оставшийся урон уменьшает текущие хиты
    const newCurrentHp = Math.max(0, currentHp - remainingDamage);
    
    // Обновляем персонажа
    onUpdate({
      currentHp: newCurrentHp,
      temporaryHp: newTempHp
    });
    
    // Если есть обработчик изменения HP, вызываем его
    if (onHpChange) {
      onHpChange(newCurrentHp);
    }
    
    // Сброс инпута урона
    setDamage(0);
  };
  
  const handleHealing = () => {
    if (!character || healing <= 0) return;
    
    // Лечение не может превысить максимум хитов
    const newCurrentHp = Math.min(maxHp, currentHp + healing);
    
    // Обновляем персонажа
    onUpdate({
      currentHp: newCurrentHp
    });
    
    // Если есть обработчик изменения HP, вызываем его
    if (onHpChange) {
      onHpChange(newCurrentHp);
    }
    
    // Сброс инпута лечения
    setHealing(0);
  };
  
  const handleAddTempHP = () => {
    if (!character || tempHP <= 0) return;
    
    // Временные хиты не складываются, берём наибольшее значение
    const newTempHp = Math.max(temporaryHp, tempHP);
    
    // Обновляем персонажа
    onUpdate({
      temporaryHp: newTempHp
    });
    
    // Сброс инпута временных хитов
    setTempHP(0);
  };
  
  // Рассчитываем процент здоровья для прогресс-бара
  const healthPercentage = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;

  return (
    <Card className="shadow-lg relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Ресурсы персонажа</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Хиты</span>
            <span>{currentHp} / {maxHp} {temporaryHp > 0 && `(+${temporaryHp})`}</span>
          </div>
          
          <div className="relative">
            <Progress value={healthPercentage} className="h-3" />
            {temporaryHp > 0 && (
              <div 
                className="absolute top-0 left-0 h-3 bg-blue-400 opacity-50 rounded-full"
                style={{ 
                  width: `${(temporaryHp / maxHp) * 100}%`,
                  maxWidth: '100%'
                }}
              />
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div>
              <input
                type="number"
                min="0"
                value={damage}
                onChange={(e) => setDamage(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full mb-1 px-2 py-1 border rounded"
                placeholder="Урон"
              />
              <Button onClick={handleDamage} variant="destructive" size="sm" className="w-full">
                Урон
              </Button>
            </div>
            
            <div>
              <input
                type="number"
                min="0"
                value={healing}
                onChange={(e) => setHealing(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full mb-1 px-2 py-1 border rounded"
                placeholder="Лечение"
              />
              <Button onClick={handleHealing} variant="default" size="sm" className="w-full bg-green-600 hover:bg-green-700">
                Лечение
              </Button>
            </div>
            
            <div>
              <input
                type="number"
                min="0"
                value={tempHP}
                onChange={(e) => setTempHP(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full mb-1 px-2 py-1 border rounded"
                placeholder="Врем. хиты"
              />
              <Button onClick={handleAddTempHP} variant="secondary" size="sm" className="w-full">
                Врем. хиты
              </Button>
            </div>
          </div>
        </div>

        {character && character.hitDice && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Кости хитов ({character.hitDice.dieType})</span>
              <span>{character.hitDice.total && character.hitDice.used 
                ? `${character.hitDice.total - character.hitDice.used} / ${character.hitDice.total}` 
                : "—"}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-grow"
                onClick={() => {
                  if (!character.hitDice || !character.hitDice.used) return;
                  
                  const newUsed = Math.max(0, character.hitDice.used - 1);
                  onUpdate({
                    hitDice: {
                      ...character.hitDice,
                      used: newUsed
                    }
                  });
                }}
              >
                Восстановить
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-grow"
                onClick={() => {
                  if (!character.hitDice || !character.hitDice.total || !character.hitDice.used) return;
                  
                  const newUsed = Math.min(character.hitDice.total, (character.hitDice.used || 0) + 1);
                  onUpdate({
                    hitDice: {
                      ...character.hitDice,
                      used: newUsed
                    }
                  });
                }}
              >
                Использовать
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-col items-start">
        {/* Дополнительные ресурсы персонажа могут быть добавлены здесь */}
      </CardFooter>
    </Card>
  );
};

export default ResourcePanel;
