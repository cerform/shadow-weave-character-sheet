
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HPBarProps {
  currentHp: number;
  maxHp: number;
  temporaryHp: number;
  onUpdate: (updates: {
    currentHp?: number;
    temporaryHp?: number;
  }) => void;
}

export const HPBar: React.FC<HPBarProps> = ({
  currentHp,
  maxHp,
  temporaryHp,
  onUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [healAmount, setHealAmount] = useState<number>(0);
  const [tempHPAmount, setTempHPAmount] = useState<number>(0);
  const { toast } = useToast();

  // Рассчитываем процент здоровья для отображения прогресс-бара
  const healthPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  // Определяем цвет полосы здоровья в зависимости от процента
  const getHealthColor = () => {
    if (healthPercent > 60) return 'bg-green-500';
    if (healthPercent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Обработчик получения урона
  const handleTakeDamage = (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Урон должен быть положительным числом",
        variant: "destructive"
      });
      return;
    }

    // Сначала урон идет по временным хитам
    let remainingDamage = amount;
    let newTempHP = temporaryHp;
    
    if (temporaryHp > 0) {
      if (temporaryHp >= remainingDamage) {
        newTempHP = temporaryHp - remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage = remainingDamage - temporaryHp;
        newTempHP = 0;
      }
    }

    // Оставшийся урон идет по основным хитам
    const newCurrentHP = Math.max(0, currentHp - remainingDamage);

    // Сохраняем изменения
    onUpdate({
      currentHp: newCurrentHP,
      temporaryHp: newTempHP
    });

    // Уведомляем пользователя
    toast({
      title: "Урон получен",
      description: `Получен урон: ${amount}. Осталось ХП: ${newCurrentHP}${newTempHP > 0 ? ` (+ ${newTempHP} врем.)` : ''}`,
    });

    // Закрываем диалог
    setIsOpen(false);
    setDamageAmount(0);
  };

  // Обработчик лечения
  const handleHeal = (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Лечение должно быть положительным числом",
        variant: "destructive"
      });
      return;
    }

    // Лечение не может превысить максимальные хиты
    const newCurrentHP = Math.min(maxHp, currentHp + amount);

    // Сохраняем изменения
    onUpdate({ currentHp: newCurrentHP });

    // Уведомляем пользователя
    toast({
      title: "Лечение получено",
      description: `Восстановлено ХП: ${amount}. Текущие ХП: ${newCurrentHP}${temporaryHp > 0 ? ` (+ ${temporaryHp} врем.)` : ''}`,
    });

    // Закрываем диалог
    setIsOpen(false);
    setHealAmount(0);
  };

  // Обработчик добавления временных хитов
  const handleAddTempHP = (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Временные хиты должны быть положительным числом",
        variant: "destructive"
      });
      return;
    }

    // Временные хиты не складываются, берем наибольшее значение
    const newTempHP = Math.max(temporaryHp, amount);

    // Сохраняем изменения
    onUpdate({ temporaryHp: newTempHP });

    // Уведомляем пользователя
    toast({
      title: "Получены временные хиты",
      description: `Временные хиты: ${newTempHP}`,
    });

    // Закрываем диалог
    setIsOpen(false);
    setTempHPAmount(0);
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-medium">Здоровье</span>
          </div>
          <div className="text-right">
            <span className="font-bold">{currentHp}/{maxHp}</span>
            {temporaryHp > 0 && (
              <span className="ml-1 text-cyan-400">+{temporaryHp}</span>
            )}
          </div>
        </div>
        
        {/* Полоса здоровья */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1 mb-3">
          <div 
            className={`h-full ${getHealthColor()} transition-all duration-300`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>

        {/* Кнопки управления хитами */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="grid grid-cols-3 gap-2">
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsOpen(true)}
              >
                <Minus className="h-4 w-4 mr-1 text-red-500" />
                Урон
              </Button>
            </DialogTrigger>
            
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1 text-green-500" />
                Лечение
              </Button>
            </DialogTrigger>
            
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsOpen(true)}
              >
                <Shield className="h-4 w-4 mr-1 text-cyan-400" />
                Врем. ХП
              </Button>
            </DialogTrigger>
          </div>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Изменение хитов</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="damage">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="damage">Урон</TabsTrigger>
                <TabsTrigger value="heal">Лечение</TabsTrigger>
                <TabsTrigger value="temp">Временные ХП</TabsTrigger>
              </TabsList>
              
              <TabsContent value="damage" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="damage-amount">Количество урона</Label>
                  <Input
                    id="damage-amount"
                    type="number"
                    min="0"
                    value={damageAmount}
                    onChange={(e) => setDamageAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <Slider
                  value={[damageAmount]}
                  min={0}
                  max={maxHp}
                  step={1}
                  onValueChange={(value) => setDamageAmount(value[0])}
                />
                <div className="text-sm text-muted-foreground">
                  Текущие ХП: {currentHp}/{maxHp} {temporaryHp > 0 ? `(+${temporaryHp} врем.)` : ''}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => handleTakeDamage(damageAmount)}
                    variant="destructive"
                  >
                    Получить урон
                  </Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="heal" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heal-amount">Количество лечения</Label>
                  <Input
                    id="heal-amount"
                    type="number"
                    min="0"
                    value={healAmount}
                    onChange={(e) => setHealAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <Slider
                  value={[healAmount]}
                  min={0}
                  max={maxHp - currentHp}
                  step={1}
                  onValueChange={(value) => setHealAmount(value[0])}
                />
                <div className="text-sm text-muted-foreground">
                  Текущие ХП: {currentHp}/{maxHp}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => handleHeal(healAmount)}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Получить лечение
                  </Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="temp" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temp-amount">Временные хиты</Label>
                  <Input
                    id="temp-amount"
                    type="number"
                    min="0"
                    value={tempHPAmount}
                    onChange={(e) => setTempHPAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <Slider
                  value={[tempHPAmount]}
                  min={0}
                  max={Math.max(20, temporaryHp * 2)}
                  step={1}
                  onValueChange={(value) => setTempHPAmount(value[0])}
                />
                <div className="text-sm text-muted-foreground">
                  Текущие временные ХП: {temporaryHp}
                </div>
                <div className="text-sm text-cyan-400/80">
                  Временные хиты не складываются. Используется наибольшее значение.
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => handleAddTempHP(tempHPAmount)}
                    variant="default"
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Получить временные ХП
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
