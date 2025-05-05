
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Character } from '@/types/character';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export interface ResourcePanelProps {
  character: Character | null;
  onUpdate: (updates: Partial<Character>) => void;
  onHpChange?: (newHp: number) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, onUpdate, onHpChange }) => {
  const [damage, setDamage] = useState<number>(0);
  const [healing, setHealing] = useState<number>(0);
  const [tempHP, setTempHP] = useState<number>(0);
  const [showHpHistory, setShowHpHistory] = useState(false);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
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

  // Функция для применения эффектов после короткого отдыха
  const handleShortRest = () => {
    if (!character) return;
    
    // Восстанавливаем хит-дайсы (только часть)
    const hitDice = character.hitDice || { total: character.level || 0, used: 0, dieType: 'd8' };
    const recovered = Math.max(1, Math.floor((character.level || 0) / 2));
    const newUsed = Math.max(0, hitDice.used || 0 - recovered);
    
    onUpdate({
      hitDice: {
        ...hitDice,
        used: newUsed
      }
    });
  };

  // Функция для применения эффектов после длительного отдыха
  const handleLongRest = () => {
    if (!character) return;
    
    // Восстанавливаем все хиты
    const newHp = character.maxHp || 0;
    
    // Восстанавливаем все хит-дайсы (только половину)
    const hitDice = character.hitDice || { total: character.level || 0, used: 0, dieType: 'd8' };
    const recovered = Math.max(1, Math.floor((hitDice.total || 0) / 2));
    const newUsed = Math.max(0, hitDice.used || 0 - recovered);
    
    // Сбрасываем временные хиты
    onUpdate({
      currentHp: newHp,
      temporaryHp: 0,
      hitDice: {
        ...hitDice,
        used: newUsed
      },
      // Восстанавливаем слоты заклинаний, если они есть
      spellSlots: Object.entries(character.spellSlots || {}).reduce((acc, [level, slot]) => {
        acc[Number(level)] = { ...slot, used: 0 };
        return acc;
      }, {} as Record<number, { max: number; used: number }>)
    });
    
    if (onHpChange) {
      onHpChange(newHp);
    }
  };
  
  // Рассчитываем процент здоровья для прогресс-бара
  const healthPercentage = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;

  return (
    <Card className="shadow-lg relative" 
         style={{ 
           backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
           borderColor: currentTheme.accent
         }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl" style={{ color: currentTheme.textColor }}>Ресурсы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium" style={{ color: currentTheme.textColor }}>Хиты</span>
            <span style={{ color: currentTheme.textColor }}>
              {currentHp} / {maxHp} {temporaryHp > 0 && `(+${temporaryHp})`}
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={healthPercentage} 
              className="h-3"
              style={{ 
                backgroundColor: `${currentTheme.accent}20`
              }} 
            />
            {temporaryHp > 0 && (
              <div 
                className="absolute top-0 left-0 h-3 bg-blue-400 opacity-50 rounded-full"
                style={{ 
                  width: `${Math.min(100, (temporaryHp / maxHp) * 100)}%`,
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
                style={{ 
                  backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
                  color: currentTheme.textColor,
                  borderColor: currentTheme.accent
                }}
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
                style={{ 
                  backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
                  color: currentTheme.textColor,
                  borderColor: currentTheme.accent
                }}
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
                style={{ 
                  backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
                  color: currentTheme.textColor,
                  borderColor: currentTheme.accent
                }}
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
              <span className="font-medium" style={{ color: currentTheme.textColor }}>Кости хитов ({character.hitDice.dieType})</span>
              <span style={{ color: currentTheme.textColor }}>
                {character.hitDice.total && character.hitDice.used !== undefined
                  ? `${character.hitDice.total - character.hitDice.used} / ${character.hitDice.total}` 
                  : "—"}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-grow"
                style={{ 
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
                onClick={() => {
                  if (!character.hitDice || character.hitDice.used === undefined) return;
                  
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
                style={{ 
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
                onClick={() => {
                  if (!character.hitDice || 
                      character.hitDice.used === undefined || 
                      character.hitDice.total === undefined) return;
                  
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

        {/* Добавляем кнопки для отдыха */}
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex-grow"
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
            onClick={handleShortRest}
          >
            Короткий отдых
          </Button>
          <Button 
            variant="outline"
            className="flex-grow"
            style={{ 
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
            onClick={handleLongRest}
          >
            Длинный отдых
          </Button>
        </div>

        {/* История изменений HP */}
        <Sheet open={showHpHistory} onOpenChange={setShowHpHistory}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              style={{ color: currentTheme.mutedTextColor }}
            >
              История изменений HP
            </Button>
          </SheetTrigger>
          <SheetContent
            style={{
              backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
              borderColor: currentTheme.accent
            }}
          >
            <SheetHeader>
              <SheetTitle style={{ color: currentTheme.textColor }}>История изменений HP</SheetTitle>
              <SheetDescription style={{ color: currentTheme.mutedTextColor }}>
                Хронология всех изменений здоровья персонажа
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[400px] mt-4">
              <div className="space-y-4">
                <div className="p-3 border rounded-md" style={{ borderColor: currentTheme.accent }}>
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.textColor }}>Урон от атаки огра</span>
                    <span className="text-red-500">-15 HP</span>
                  </div>
                  <div className="text-sm mt-1" style={{ color: currentTheme.mutedTextColor }}>
                    10 минут назад - HP: 32 → 17
                  </div>
                </div>
                <div className="p-3 border rounded-md" style={{ borderColor: currentTheme.accent }}>
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.textColor }}>Лечащее слово</span>
                    <span className="text-green-500">+8 HP</span>
                  </div>
                  <div className="text-sm mt-1" style={{ color: currentTheme.mutedTextColor }}>
                    15 минут назад - HP: 24 → 32
                  </div>
                </div>
                <div className="p-3 border rounded-md" style={{ borderColor: currentTheme.accent }}>
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.textColor }}>Длинный отдых</span>
                    <span className="text-green-500">+16 HP</span>
                  </div>
                  <div className="text-sm mt-1" style={{ color: currentTheme.mutedTextColor }}>
                    3 часа назад - HP: 8 → 24
                  </div>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
