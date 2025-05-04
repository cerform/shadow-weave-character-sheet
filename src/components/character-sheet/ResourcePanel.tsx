
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Heart, Skull, Activity, Clock, Shield, Dices } from 'lucide-react';
import { Character } from '@/contexts/CharacterContext';
import DiceRoller3DFixed from '@/components/character-sheet/DiceRoller3DFixed';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";

interface ResourcePanelProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, updateCharacter }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Состояние для текущих хитов
  const [currentHp, setCurrentHp] = useState(character.currentHp || character.maxHp || 0);
  // Состояние для временных хитов
  const [temporaryHp, setTemporaryHp] = useState(character.temporaryHp || 0);
  // Состояние для кубиков хитов
  const [hitDiceUsed, setHitDiceUsed] = useState(character.hitDice?.used || 0);
  
  // Состояние для диалога смерти
  const [deathSaveDialogOpen, setDeathSaveDialogOpen] = useState(false);
  // Состояние для успешных спасбросков от смерти
  const [deathSaveSuccesses, setDeathSaveSuccesses] = useState(character.deathSaves?.successes || 0);
  // Состояние для проваленных спасбросков от смерти
  const [deathSaveFailures, setDeathSaveFailures] = useState(character.deathSaves?.failures || 0);
  // Состояние для диалога броска кубика хитов
  const [hitDiceDialogOpen, setHitDiceDialogOpen] = useState(false);
  // Результат броска кубика хитов
  const [hitDiceRollResult, setHitDiceRollResult] = useState<number | null>(null);
  // Максимальное значение хитов
  const maxHp = character.maxHp || 10;
  // Кубик хитов (зависит от класса)
  const hitDiceType = useMemo(() => {
    switch(character.class) {
      case "Варвар": return "d12";
      case "Воин":
      case "Паладин":
      case "Следопыт": return "d10";
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут":
      case "Бард":
      case "Колдун":
      case "Чернокнижник": return "d8";
      case "Волшебник":
      case "Чародей": return "d6";
      default: return "d8";
    }
  }, [character.class]);
  
  // Модификатор телосложения для восстановления хитов
  const conModifier = useMemo(() => {
    const con = character.abilities?.CON || character.abilities?.constitution || 10;
    return Math.floor((con - 10) / 2);
  }, [character.abilities]);
  
  // Обновление состояния при изменении персонажа
  useEffect(() => {
    setCurrentHp(character.currentHp !== undefined ? character.currentHp : character.maxHp || 0);
    setTemporaryHp(character.temporaryHp || 0);
    setHitDiceUsed(character.hitDice?.used || 0);
    setDeathSaveSuccesses(character.deathSaves?.successes || 0);
    setDeathSaveFailures(character.deathSaves?.failures || 0);
  }, [character]);
  
  // Расчет процента оставшихся хитов
  const healthPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  // Определение цвета полосы здоровья на основе процента
  const healthColor = () => {
    if (healthPercentage <= 25) return "bg-red-500";
    if (healthPercentage <= 50) return "bg-amber-500";
    return "bg-green-500";
  };
  
  // Получение общего количества хитов (текущие + временные)
  const totalCurrentHp = currentHp + temporaryHp;
  
  // Обработчик изменения хитов
  const handleHpChange = (amount: number) => {
    let newTemporaryHp = temporaryHp;
    let newCurrentHp = currentHp;
    
    // При получении урона сначала вычитаем из временных хитов
    if (amount < 0) {
      const damage = Math.abs(amount);
      
      // Если есть временные хиты
      if (newTemporaryHp > 0) {
        // Если урон меньше или равен временным хитам
        if (damage <= newTemporaryHp) {
          newTemporaryHp -= damage;
        } else {
          // Вычитаем остаток урона из основных хитов
          const remainingDamage = damage - newTemporaryHp;
          newTemporaryHp = 0;
          newCurrentHp = Math.max(0, newCurrentHp - remainingDamage);
        }
      } else {
        // Если нет временных хитов, вычитаем из основных
        newCurrentHp = Math.max(0, newCurrentHp - damage);
      }
      
      // Проверяем, не упали ли хиты до 0
      if (newCurrentHp === 0) {
        // Если персонаж падает до 0, открываем диалог спасбросков от смерти
        setDeathSaveDialogOpen(true);
        toast({
          title: "Персонаж без сознания!",
          description: "Ваши хиты упали до 0. Начинаются спасброски от смерти.",
          variant: "destructive"
        });
      }
    } else {
      // При лечении увеличиваем только основные хиты, но не выше максимума
      newCurrentHp = Math.min(maxHp, newCurrentHp + amount);
    }
    
    // Обновляем состояние персонажа
    setCurrentHp(newCurrentHp);
    setTemporaryHp(newTemporaryHp);
    
    // Обновляем персонажа в контексте
    updateCharacter({
      currentHp: newCurrentHp,
      temporaryHp: newTemporaryHp
    });
  };
  
  // Обработчик броска кубика хитов
  const handleHitDiceRoll = () => {
    // Проверяем, остались ли неиспользованные кубики хитов
    if (hitDiceUsed >= (character.hitDice?.total || character.level || 1)) {
      toast({
        title: "Нет доступных кубиков хитов",
        description: "Вы уже использовали все свои кубики хитов. Отдохните, чтобы восстановить их.",
        variant: "destructive"
      });
      return;
    }
    
    // Открываем диалог броска кубика хитов
    setHitDiceDialogOpen(true);
    // Сбрасываем предыдущий результат
    setHitDiceRollResult(null);
  };
  
  // Обработчик завершения броска кубика хитов
  const onHitDiceRollComplete = (result: number) => {
    // Рассчитываем восстановление хитов: результат броска + модификатор телосложения
    const healAmount = Math.max(1, result + conModifier); // Минимум 1 хит
    setHitDiceRollResult(healAmount);
    
    // Восстанавливаем хиты
    const newHp = Math.min(maxHp, currentHp + healAmount);
    setCurrentHp(newHp);
    
    // Увеличиваем счетчик использованных кубиков хитов
    const newHitDiceUsed = hitDiceUsed + 1;
    setHitDiceUsed(newHitDiceUsed);
    
    // Обновляем персонажа в контексте
    updateCharacter({
      currentHp: newHp,
      hitDice: {
        ...character.hitDice,
        used: newHitDiceUsed
      }
    });
    
    toast({
      title: "Исцеление!",
      description: `Вы восстановили ${healAmount} хитов, используя кубик хитов.`,
    });
  };
  
  // Обработчик добавления временных хитов
  const addTemporaryHp = (amount: number) => {
    const newTemporaryHp = temporaryHp + amount;
    setTemporaryHp(newTemporaryHp);
    
    updateCharacter({
      temporaryHp: newTemporaryHp
    });
  };
  
  // Обработчик сброса временных хитов
  const resetTemporaryHp = () => {
    setTemporaryHp(0);
    
    updateCharacter({
      temporaryHp: 0
    });
  };
  
  // Обработчик спасброска от смерти
  const handleDeathSave = (result: number) => {
    let newSuccesses = deathSaveSuccesses;
    let newFailures = deathSaveFailures;
    
    // Натуральная 20 - персонаж стабилизируется и получает 1 хит
    if (result === 20) {
      setCurrentHp(1);
      setDeathSaveSuccesses(0);
      setDeathSaveFailures(0);
      setDeathSaveDialogOpen(false);
      
      updateCharacter({
        currentHp: 1,
        deathSaves: {
          successes: 0,
          failures: 0
        }
      });
      
      toast({
        title: "Чудесное спасение!",
        description: "Вы выбросили 20! Персонаж стабилизируется и получает 1 хит.",
      });
      return;
    }
    
    // Натуральная 1 - два провала
    if (result === 1) {
      newFailures += 2;
    } else if (result >= 10) {
      newSuccesses += 1;
    } else {
      newFailures += 1;
    }
    
    // Обновляем счетчики
    setDeathSaveSuccesses(newSuccesses);
    setDeathSaveFailures(newFailures);
    
    // Обновляем персонажа в контексте
    updateCharacter({
      deathSaves: {
        successes: newSuccesses,
        failures: newFailures
      }
    });
    
    // Проверяем результат спасбросков
    if (newSuccesses >= 3) {
      toast({
        title: "Стабилизация!",
        description: "Вы успешно стабилизировались после 3 успешных спасбросков.",
      });
      setDeathSaveDialogOpen(false);
    } else if (newFailures >= 3) {
      toast({
        title: "Смерть!",
        description: "Вы не смогли стабилизироваться после 3 проваленных спасбросков.",
        variant: "destructive"
      });
    }
  };
  
  // Обработчик воскрешения персонажа
  const reviveCharacter = (hp: number = 1) => {
    setCurrentHp(hp);
    setDeathSaveSuccesses(0);
    setDeathSaveFailures(0);
    setDeathSaveDialogOpen(false);
    
    updateCharacter({
      currentHp: hp,
      deathSaves: {
        successes: 0,
        failures: 0
      }
    });
    
    toast({
      title: "Воскрешение!",
      description: `Персонаж воскрешен с ${hp} хитами.`,
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Полоса здоровья */}
      <Card className="relative p-4 overflow-hidden">
        <div className={`absolute top-0 left-0 h-1 ${healthColor()}`} style={{ width: `${healthPercentage}%` }}></div>
        
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Здоровье
          </h3>
          <div className="text-sm">
            {currentHp} / {maxHp}
            {temporaryHp > 0 && <span className="text-cyan-400 ml-1">+{temporaryHp}</span>}
          </div>
        </div>
        
        <Progress value={healthPercentage} className="h-2" />
        
        <div className="grid grid-cols-4 gap-2 mt-3">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleHpChange(-1)}
          >
            -1
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleHpChange(-5)}
          >
            -5
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleHpChange(1)}
            className="bg-green-500/10 hover:bg-green-500/20"
          >
            +1
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleHpChange(5)}
            className="bg-green-500/10 hover:bg-green-500/20"
          >
            +5
          </Button>
        </div>
        
        {/* Временные хиты */}
        {temporaryHp > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-cyan-400">Временные хиты: {temporaryHp}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetTemporaryHp}
              className="text-xs h-6 px-2"
            >
              Сбросить
            </Button>
          </div>
        )}
        
        {/* Кнопки для временных хитов */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => addTemporaryHp(5)}
            className="bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center"
          >
            <Shield className="w-3 h-3 mr-1" />
            +5 врем.
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setDeathSaveDialogOpen(true)}
            className="bg-purple-500/10 hover:bg-purple-500/20 flex items-center"
          >
            <Skull className="w-3 h-3 mr-1" />
            Спасброски
          </Button>
        </div>
      </Card>
      
      {/* Кубики хитов */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold flex items-center">
            <Dices className="w-5 h-5 mr-2 text-amber-500" />
            Кубики хитов
          </h3>
          <div className="text-sm">
            {(character.hitDice?.total || character.level || 1) - hitDiceUsed} / {character.hitDice?.total || character.level || 1}
          </div>
        </div>
        
        <Progress 
          value={((character.hitDice?.total || character.level || 1) - hitDiceUsed) / (character.hitDice?.total || character.level || 1) * 100} 
          className="h-2 mb-3" 
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleHitDiceRoll}
          disabled={hitDiceUsed >= (character.hitDice?.total || character.level || 1)}
          className="w-full bg-amber-500/10 hover:bg-amber-500/20"
        >
          Использовать кубик хитов ({hitDiceType})
        </Button>
      </Card>
      
      {/* Диалог спасбросков от смерти */}
      <Dialog open={deathSaveDialogOpen} onOpenChange={setDeathSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Спасброски от смерти</DialogTitle>
            <DialogDescription>
              Ваш персонаж без сознания и должен делать спасброски от смерти.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-center items-center gap-6 mb-4">
              <div className="text-center">
                <p className="mb-1 text-green-500 font-medium">Успехи</p>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={`success-${i}`} 
                      className={`w-6 h-6 rounded-full border ${i < deathSaveSuccesses ? 'bg-green-500 border-green-600' : 'border-green-600 border-dashed'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="mb-1 text-red-500 font-medium">Провалы</p>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={`failure-${i}`} 
                      className={`w-6 h-6 rounded-full border ${i < deathSaveFailures ? 'bg-red-500 border-red-600' : 'border-red-600 border-dashed'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-32 h-32">
                <DiceRoller3DFixed 
                  initialDice="d20"
                  onRollComplete={handleDeathSave}
                  themeColor={currentTheme.accent}
                  fixedPosition={true}
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => reviveCharacter(1)}
              >
                Стабилизировать (1 HP)
              </Button>
              <Button 
                variant="default"
                onClick={() => reviveCharacter(Math.max(1, Math.floor(maxHp / 4)))}
              >
                Исцелить ({Math.max(1, Math.floor(maxHp / 4))} HP)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Диалог броска кубика хитов */}
      <Dialog open={hitDiceDialogOpen} onOpenChange={setHitDiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Использование кубика хитов</DialogTitle>
            <DialogDescription>
              Бросьте {hitDiceType} + {conModifier >= 0 ? `+${conModifier}` : conModifier} (модификатор телосложения)
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <div className="w-32 h-32">
                <DiceRoller3DFixed 
                  initialDice={hitDiceType as "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100"}
                  onRollComplete={onHitDiceRollComplete}
                  themeColor={currentTheme.accent}
                  fixedPosition={true}
                  modifier={conModifier}
                />
              </div>
            </div>
            
            {hitDiceRollResult !== null && (
              <div className="text-center mt-2">
                <p className="text-lg font-bold">Восстановлено: {hitDiceRollResult} HP</p>
                <p className="text-sm text-muted-foreground">
                  Осталось кубиков хитов: {(character.hitDice?.total || character.level || 1) - (hitDiceUsed + 1)} / {character.hitDice?.total || character.level || 1}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourcePanel;
